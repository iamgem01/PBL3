import React, { useState, useEffect } from "react";
import { apiService, ApiError, type UserPreferences } from "../../services/api";
import Sidebar from "../../components/layout/sidebar/sidebar";
import HistoryPanel from "../../components/ui/HistoryPanel";
import Header from "../../components/ui/header";
import ChatArea from "../../components/ui/Chatarea";
import InputArea from "../../components/ui/InputArea";
import PersonalizeModal from "@/components/modals/PersonalizeModal";
import type { Chat, MessageItem } from "../../components/ui/sidebar";

const ChatPage: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

    // User preferences state
    const [userPreferences, setUserPreferences] = useState<UserPreferences>({
        tone: 'professional',
        responseLength: 'detailed',
        expertise: 'intermediate'
    });

    // Load default preferences on mount
    useEffect(() => {
        loadDefaultPreferences();
    }, []);

    const loadDefaultPreferences = async () => {
        try {
            const response = await apiService.getDefaultPreferences();
            if (response.data.defaultPreferences) {
                setUserPreferences(response.data.defaultPreferences);
                console.log('✅ Loaded default preferences:', response.data.defaultPreferences);
            }
        } catch (error) {
            // Use fallback preferences if API fails
            console.log('ℹ️ Using default preferences (API not available)');
            setUserPreferences({
                tone: 'professional',
                responseLength: 'detailed',
                expertise: 'intermediate'
            });
        }
    };

    const handleTogglePersonalise = () => {
        setIsPersonalizeOpen(true);
    };

    const [chats, setChats] = useState<Chat[]>([
        { id: 1, title: "Hi", messages: [] },
    ]);
    const [selectedChatId, setSelectedChatId] = useState(1);
    const [isTyping, setIsTyping] = useState(false);
    const [, setError] = useState<string | null>(null);

    const selectedChat = chats.find((chat) => chat.id === selectedChatId);

    const handleSendMessage = async (
        text: string,
        action: "chat" | "summarize" | "note" | "explain" | "improve" | "translate" = "chat",
        notes?: Array<{ id: string; title: string; content?: string }>,
        files?: File[]
    ) => {
        // Validate input
        if (!text.trim() && (!files || files.length === 0)) {
            console.warn('⚠️ Empty message and no files');
            return;
        }

        const userMessage: MessageItem = {
            id: Date.now(),
            text: text || "🔎 Đã gửi file(s)",
            isUser: true,
            timestamp: new Date(),
            attachments: files ? files.map(file => ({
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type,
                size: file.size
            })) : undefined
        };

        // Tạo context từ selected notes
        const context =
            notes && notes.length > 0
                ? notes
                    .map((note) => {
                        const noteContent = note.content || "";
                        return `### 📝 Note: ${note.title}\n\n${noteContent}`;
                    })
                    .join("\n\n---\n\n")
                : undefined;

        // Lưu thông tin về context và files để hiển thị trong AI response
        const contextSummary = notes && notes.length > 0 
            ? `Đã sử dụng ${notes.length} ghi chú làm context`
            : undefined;

        const filesInfo = files && files.length > 0
            ? files.map(f => ({
                name: f.name,
                type: f.type,
                size: f.size
            }))
            : undefined;

        setChats((prev) => {
            const updated = prev.map((chat) => {
                if (chat.id === selectedChatId) {
                    const newMessages = [...chat.messages, userMessage];
                    const newTitle =
                        chat.messages.length === 0
                            ? text.length > 30
                                ? text.substring(0, 30) + "..."
                                : text || "File conversation"
                            : chat.title;
                    return { ...chat, messages: newMessages, title: newTitle };
                }
                return chat;
            });
            return updated;
        });

        setIsTyping(true);
        setError(null);

        try {
            console.log('🚀 Sending to API...');

            const shouldSendPreferences = false;

            const response = await apiService.sendMessage({
                message: text || "Hãy phân tích các file tôi gửi",
                action,
                context,
                files,
                preferences: shouldSendPreferences ? userPreferences : undefined
            });

            console.log('✅ Received response:', {
                responseLength: response.data.response?.length || 0,
                metadata: response.data.metadata
            });

            const aiResponse: MessageItem = {
                id: Date.now() + 1,
                text: response.data.response,
                isUser: false,
                timestamp: new Date(),
                metadata: response.data.metadata,
                // Thêm thông tin về context và files đã sử dụng
                contextUsed: contextSummary,
                notesUsed: notes,
                filesUsed: filesInfo
            };

            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === selectedChatId
                        ? { ...chat, messages: [...chat.messages, aiResponse] }
                        : chat
                )
            );
        } catch (err) {
            console.error("❌ Error sending message:", err);
            
            if (err instanceof ApiError) {
                console.error("📋 Error details:", {
                    message: err.message,
                    statusCode: err.statusCode,
                    errors: err.errors
                });
            }
            
            const errorMessage =
                err instanceof ApiError
                    ? err.message
                    : "Không thể kết nối đến server. Vui lòng thử lại sau.";
            
            setError(errorMessage);

            let errorDetails = "";
            if (err instanceof ApiError && err.errors) {
                errorDetails = "\n\n**Chi tiết lỗi:**\n" + 
                    err.errors.map(e => `- ${e.field}: ${e.message}`).join('\n');
            }

            const errorResponse: MessageItem = {
                id: Date.now() + 1,
                text: `❌ **Lỗi**: ${errorMessage}${errorDetails}\n\n*Tip: Kiểm tra console để xem chi tiết lỗi*`,
                isUser: false,
                timestamp: new Date(),
            };

            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === selectedChatId
                        ? { ...chat, messages: [...chat.messages, errorResponse] }
                        : chat
                )
            );
        } finally {
            setIsTyping(false);
        }
    };

    const handleNewChat = () => {
        const newChat: Chat = {
            id: Date.now(),
            title: "New chat",
            messages: [],
        };
        setChats((prev) => [newChat, ...prev]);
        setSelectedChatId(newChat.id);
        setError(null);
    };

    const handleDeleteChat = (id: number) => {
        setChats((prev) => prev.filter((chat) => chat.id !== id));
        if (selectedChatId === id && chats.length > 1) {
            const nextChat = chats.find((chat) => chat.id !== id);
            if (nextChat) setSelectedChatId(nextChat.id);
        }
    };

    const hasMessages = selectedChat && selectedChat.messages.length > 0;

    // Tính toán margin và width dựa trên trạng thái sidebar và history
    const getMainContentStyle = () => {
        if (isHistoryOpen) {
            return {
                marginLeft: '20rem', // HistoryPanel width 80 (20rem)
                width: sidebarCollapsed
                    ? 'calc(100% - 20rem)'
                    : 'calc(100% - 20rem)'
            };
        } else {
            return {
                marginLeft: sidebarCollapsed ? '6.25rem' : '14.5rem',
                width: sidebarCollapsed
                    ? 'calc(100% - 6.25rem)'
                    : 'calc(100% - 14.5rem)'
            };
        }
    };

    // Handle preferences update
    const handlePreferencesUpdate = (newPreferences: UserPreferences) => {
        setUserPreferences(newPreferences);
        console.log('✅ Preferences updated:', newPreferences);
    };

    return (
        <div className="h-screen flex bg-background relative">
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            <HistoryPanel
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                chats={chats}
                onSelectChat={(id) => {
                    setSelectedChatId(id);
                    setIsHistoryOpen(false);
                }}
                onDeleteChat={handleDeleteChat}
                onNewChat={handleNewChat}
                selectedChatId={selectedChatId}
            />

            {/* Personalize Modal */}
            <PersonalizeModal
                isOpen={isPersonalizeOpen}
                onClose={() => setIsPersonalizeOpen(false)}
                currentPreferences={userPreferences}
                onSave={handlePreferencesUpdate}
            />

            <div
                className="flex flex-col flex-1 h-full transition-all duration-300 ease-in-out overflow-hidden"
                style={getMainContentStyle()}
            >
                <Header
                    onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
                    onTogglePersonalise={handleTogglePersonalise}
                    currentChat={selectedChat?.title}
                    hasMessages={hasMessages}
                    collapsed={sidebarCollapsed}
                />

                <div className="flex-1 overflow-hidden flex flex-col pt-14 w-full">
                    <ChatArea
                        messages={selectedChat?.messages || []}
                        isTyping={isTyping}
                        hasMessages={hasMessages}
                    />

                    <InputArea
                        onSendMessage={(text, action, notes, files) =>
                            handleSendMessage(text, action || "chat", notes, files)
                        }
                        disabled={isTyping}
                        hasMessages={hasMessages}
                        currentPreferences={userPreferences}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;