import React, { useState, useEffect, useCallback } from "react";
import { apiService, ApiError, type UserPreferences } from "../../services/api";
import Sidebar from "../../components/layout/sidebar/sidebar";
import HistoryPanel from "../../components/ui/HistoryPanel";
import Header from "../../components/ui/header";
import ChatArea from "../../components/ui/Chatarea";
import InputArea from "../../components/ui/InputArea";
import PersonalizeModal from "@/components/modals/PersonalizeModal";
import type { Chat, MessageItem } from "../../components/ui/sidebar";

// 🔥 Extended Chat interface với đầy đủ thông tin session
interface ExtendedChat extends Chat {
  sessionId?: string;
  hasContext?: boolean;
  hasFiles?: boolean;
  filesInfo?: Array<{ name: string; type: string; size: number }>;
  contextInfo?: string;
  userId?: string;
  lastUpdated?: Date;
}

const ChatPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

  // 🔥 FIX: Tạo userId ổn định với localStorage
  const [userId] = useState(() => {
    // Kiểm tra xem có đang chạy trong browser không
    if (typeof window === 'undefined') {
      return 'user-' + Date.now();
    }
    
    const storedUserId = localStorage.getItem('ai-service-userId');
    if (storedUserId) return storedUserId;
    
    const newUserId = 'user-' + Date.now();
    localStorage.setItem('ai-service-userId', newUserId);
    return newUserId;
  });

  // User preferences state
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    tone: 'professional',
    responseLength: 'detailed',
    expertise: 'intermediate'
  });

  // Chats state với session management
  const [chats, setChats] = useState<ExtendedChat[]>([
    { 
      id: 1, 
      title: "New Chat", 
      messages: [], 
      sessionId: undefined,
      hasContext: false,
      hasFiles: false,
      userId: userId,
      lastUpdated: new Date()
    },
  ]);
  
  const [selectedChatId, setSelectedChatId] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  // Load default preferences on mount
  useEffect(() => {
    loadDefaultPreferences();
  }, []);

  // 🔥 Effect để đồng bộ userId khi thay đổi
  useEffect(() => {
    setChats(prev => prev.map(chat => ({
      ...chat,
      userId: userId
    })));
  }, [userId]);

  const loadDefaultPreferences = async () => {
    try {
      const response = await apiService.getDefaultPreferences();
      if (response.data.defaultPreferences) {
        setUserPreferences(response.data.defaultPreferences);
        console.log('✅ Loaded default preferences:', response.data.defaultPreferences);
      }
    } catch (error) {
      console.log('ℹ️ Using default preferences (API not available)');
      // Giữ nguyên preferences mặc định
    }
  };

  const handleTogglePersonalise = () => {
    setIsPersonalizeOpen(true);
  };

  // 🔥 OPTIMIZED: Sử dụng useCallback để tránh re-render không cần thiết
  const handleSendMessage = useCallback(async (
    text: string,
    action: "chat" | "summarize" | "note" | "explain" | "improve" | "translate" = "chat",
    notes?: Array<{ id: string; title: string; content?: string }>,
    files?: File[]
  ) => {
    // Validate input
    if (!text.trim() && (!files || files.length === 0)) {
      console.warn('⚠️ Empty message and no files');
      setError('Vui lòng nhập tin nhắn hoặc chọn file');
      return;
    }

    // Tạo user message
    const userMessage: MessageItem = {
      id: Date.now(),
      text: text || "🔎 Đã gửi file(s) để phân tích",
      isUser: true,
      timestamp: new Date(),
      attachments: files ? files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size
      })) : undefined
    };

    // 🔥 Tạo context từ selected notes
    const context = notes && notes.length > 0
      ? notes
          .map((note) => {
            const noteContent = note.content || "";
            return `### 📝 Note: ${note.title}\n\n${noteContent}`;
          })
          .join("\n\n---\n\n")
      : undefined;

    // Thông tin để hiển thị
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

    // 🔥 Cập nhật UI ngay lập tức với user message
    setChats((prev) => {
      return prev.map((chat) => {
        if (chat.id === selectedChatId) {
          const newMessages = [...chat.messages, userMessage];
          const newTitle = chat.messages.length === 0
            ? text.length > 30 ? text.substring(0, 30) + "..." : text || "File conversation"
            : chat.title;
          
          return { 
            ...chat, 
            messages: newMessages, 
            title: newTitle,
            lastUpdated: new Date()
          };
        }
        return chat;
      });
    });

    setIsTyping(true);
    setError(null);

    try {
      console.log('🚀 Sending to API...');

      // 🔥 SMART SENDING LOGIC: Chỉ gửi context/files lần đầu
      const hasExistingSession = !!selectedChat?.sessionId;
      const shouldSendContext = !hasExistingSession && context;
      const shouldSendFiles = !hasExistingSession && files && files.length > 0;

      console.log('📊 Session Analysis:', {
        hasExistingSession,
        existingSessionId: selectedChat?.sessionId,
        shouldSendContext: !!shouldSendContext,
        shouldSendFiles: !!shouldSendFiles,
        contextLength: context?.length,
        filesCount: files?.length
      });

      const response = await apiService.sendMessage({
        message: text || "Hãy phân tích các file tôi gửi",
        action,
        context: shouldSendContext ? context : undefined,
        files: shouldSendFiles ? files : undefined,
        preferences: undefined, // Tạm thời không gửi preferences
        sessionId: selectedChat?.sessionId, // 🔥 LUÔN gửi sessionId nếu có
        userId: userId,
      });

      console.log('✅ API Response:', {
        sessionId: response.data.sessionId,
        responseLength: response.data.response?.length,
        metadata: response.data.metadata
      });

      // 🔥 CẬP NHẬT SESSION STATE với thông tin từ backend
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === selectedChatId) {
            const updatedChat: ExtendedChat = {
              ...chat,
              sessionId: response.data.sessionId || chat.sessionId,
              userId: userId,
              lastUpdated: new Date()
            };

            // Cập nhật flags từ metadata backend
            if (response.data.metadata) {
              updatedChat.hasContext = response.data.metadata.hasContext;
              updatedChat.hasFiles = response.data.metadata.hasFiles;
              
              if (filesInfo && response.data.metadata.hasFiles) {
                updatedChat.filesInfo = filesInfo;
              }
              
              if (contextSummary && response.data.metadata.hasContext) {
                updatedChat.contextInfo = contextSummary;
              }
            }

            console.log('💾 Chat State Updated:', {
              sessionId: updatedChat.sessionId,
              hasContext: updatedChat.hasContext,
              hasFiles: updatedChat.hasFiles
            });

            return updatedChat;
          }
          return chat;
        })
      );

      // Tạo AI response message
      const aiResponse: MessageItem = {
        id: Date.now() + 1,
        text: response.data.response,
        isUser: false,
        timestamp: new Date(),
        metadata: response.data.metadata,
        // Hiển thị context/files info dựa trên metadata thực tế
        contextUsed: response.data.metadata?.hasContext ? contextSummary : undefined,
        notesUsed: response.data.metadata?.hasContext ? notes : undefined,
        filesUsed: response.data.metadata?.hasFiles ? filesInfo : undefined
      };

      // Thêm AI response vào chat
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChatId
            ? { 
                ...chat, 
                messages: [...chat.messages, aiResponse],
                lastUpdated: new Date()
              }
            : chat
        )
      );

    } catch (err) {
      console.error("❌ Error sending message:", err);
      
      let errorMessage = "Không thể kết nối đến server. Vui lòng thử lại sau.";
      let errorDetails = "";

      if (err instanceof ApiError) {
        errorMessage = err.message;
        if (err.errors) {
          errorDetails = "\n\n**Chi tiết lỗi:**\n" + 
            err.errors.map(e => `- ${e.field}: ${e.message}`).join('\n');
        }
        
        console.error("📋 Error details:", {
          message: err.message,
          statusCode: err.statusCode,
          errors: err.errors
        });
      }
      
      setError(errorMessage);

      // Hiển thị error message trong chat
      const errorResponse: MessageItem = {
        id: Date.now() + 1,
        text: `❌ **Lỗi**: ${errorMessage}${errorDetails}\n\n*Vui lòng thử lại hoặc kiểm tra kết nối mạng*`,
        isUser: false,
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChatId
            ? { 
                ...chat, 
                messages: [...chat.messages, errorResponse],
                lastUpdated: new Date()
              }
            : chat
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, [selectedChatId, selectedChat?.sessionId, userId]);

  // 🔥 Tạo chat mới
  const handleNewChat = useCallback(() => {
    const newChat: ExtendedChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
      sessionId: undefined,
      hasContext: false,
      hasFiles: false,
      userId: userId,
      lastUpdated: new Date()
    };
    
    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
    setError(null);
    
    console.log('🆕 Created new chat, session will be created on first message');
  }, [userId]);

  // Xóa chat
  const handleDeleteChat = useCallback((id: number) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (selectedChatId === id && chats.length > 1) {
      const nextChat = chats.find((chat) => chat.id !== id);
      if (nextChat) setSelectedChatId(nextChat.id);
    }
  }, [selectedChatId, chats]);

  // Chọn chat
  const handleSelectChat = useCallback((id: number) => {
    setSelectedChatId(id);
    setIsHistoryOpen(false);
    setError(null);
  }, []);

  const hasMessages = selectedChat && selectedChat.messages.length > 0;

  // Tính toán layout
  const getMainContentStyle = () => {
    if (isHistoryOpen) {
      return {
        marginLeft: '20rem',
        width: sidebarCollapsed ? 'calc(100% - 20rem)' : 'calc(100% - 20rem)'
      };
    } else {
      return {
        marginLeft: sidebarCollapsed ? '6.25rem' : '14.5rem',
        width: sidebarCollapsed ? 'calc(100% - 6.25rem)' : 'calc(100% - 14.5rem)'
      };
    }
  };

  // Cập nhật preferences
  const handlePreferencesUpdate = useCallback((newPreferences: UserPreferences) => {
    setUserPreferences(newPreferences);
    console.log('✅ Preferences updated:', newPreferences);
  }, []);

  // 🔥 Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onNewChat={handleNewChat}
        selectedChatId={selectedChatId}
      />

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

        {/* 🔥 Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200">
            <div className="max-w-3xl mx-auto flex items-center justify-between text-sm text-red-700">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col pt-14 w-full">
          {/* 🔥 Session Info Banner */}
          {selectedChat?.sessionId && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <div className="max-w-3xl mx-auto flex items-center gap-2 text-xs text-blue-700">
                <span className="font-medium">📌 Session Active:</span>
                <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                  {selectedChat.sessionId.substring(0, 8)}...
                </span>
                
                {selectedChat.hasContext && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                    <span>📝</span>
                    <span>Context</span>
                  </span>
                )}
                
                {selectedChat.hasFiles && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                    <span>📎</span>
                    <span>Files ({selectedChat.filesInfo?.length || 0})</span>
                  </span>
                )}
                
                <span className="text-gray-500 ml-auto text-xs">
                </span>
              </div>
            </div>
          )}

          {/* 🔥 FIX: Remove onRetryMessage prop if ChatArea doesn't support it */}
          <ChatArea
            messages={selectedChat?.messages || []}
            isTyping={isTyping}
            hasMessages={hasMessages}
          />

          {/* 🔥 FIX: Remove error prop if InputArea doesn't support it */}
          <InputArea
            onSendMessage={handleSendMessage}
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