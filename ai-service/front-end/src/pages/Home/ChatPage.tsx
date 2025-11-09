import React, { useState } from "react";
import Sidebar, { Chat } from "../../components/ui/sidebar";
import Header from "../../components/ui/header";
import ChatArea from "../../components/ui/Chatarea";
import InputArea from "../../components/ui/InputArea";
import { apiService, ApiError } from "../../services/api";

const ChatPage: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chats, setChats] = useState<Chat[]>([
        { id: 1, title: "Xin chào", messages: [] },
    ]);
    const [selectedChatId, setSelectedChatId] = useState(1);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedChat = chats.find((chat) => chat.id === selectedChatId);

    const handleSendMessage = async (text: string, action: 'chat' | 'summarize' | 'note' | 'explain' | 'improve' | 'translate' = 'chat') => {
        
        const userMessage = {
            id: Date.now(),
            text,
            isUser: true,
            timestamp: new Date(),
        };

       
        setChats((prev) => {
            const updated = prev.map((chat) => {
                if (chat.id === selectedChatId) {
                    const newMessages = [...chat.messages, userMessage];
                    const newTitle = chat.messages.length === 0 
                        ? text.length > 30 
                            ? text.substring(0, 30) + '...' 
                            : text
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
            // Gọi API
            const response = await apiService.sendMessage({
                message: text,
                action,
            });

            // Tạo phản hồi từ AI
            const aiResponse = {
                id: Date.now() + 1,
                text: response.data.response,
                isUser: false,
                timestamp: new Date(),
            };

            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === selectedChatId
                        ? { ...chat, messages: [...chat.messages, aiResponse] }
                        : chat
                )
            );
        } catch (err) {
            console.error('Error sending message:', err);
            const errorMessage = err instanceof ApiError 
                ? err.message 
                : 'Không thể kết nối đến server. Vui lòng thử lại sau.';
            setError(errorMessage);

            // Hiển thị lỗi trong chat
            const errorResponse = {
                id: Date.now() + 1,
                text: `❌ Lỗi: ${errorMessage}`,
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
            title: "Cuộc trò chuyện mới",
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

    return (
        <div className="h-screen flex flex-col bg-white">
            <Sidebar
                isOpen={isSidebarOpen}
                chats={chats}
                onSelectChat={setSelectedChatId}
                onDeleteChat={handleDeleteChat}
                onNewChat={handleNewChat}
                selectedChatId={selectedChatId}
            />
            <div
                className={`flex flex-col h-full transition-all duration-300 ${
                    isSidebarOpen ? "ml-64" : "ml-0"
                }`}
            >
                <Header
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    currentChat={selectedChat?.title}
                />
                {error && (
                    <div className="mx-auto max-w-3xl w-full px-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}
                <ChatArea messages={selectedChat?.messages || []} isTyping={isTyping} />
                <InputArea onSendMessage={(text, action) => handleSendMessage(text, action || 'chat')} disabled={isTyping} />
            </div>
        </div>
    );
};

export default ChatPage;