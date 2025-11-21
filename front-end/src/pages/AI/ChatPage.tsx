import React, { useState } from "react";
import { apiService, ApiError } from "../../services/api";
import Sidebar from "../../components/layout/sidebar/sidebar";
import HistoryPanel from "../../components/ui/HistoryPanel";
import Header from "../../components/ui/header";
import ChatArea from "../../components/ui/Chatarea";
import InputArea from "../../components/ui/InputArea";
import type { Chat } from "../../components/ui/sidebar";

const ChatPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, title: "Xin chào", messages: [] },
  ]);
  const [selectedChatId, setSelectedChatId] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [, setError] = useState<string | null>(null);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  const handleSendMessage = async (
    text: string,
    action:
      | "chat"
      | "summarize"
      | "note"
      | "explain"
      | "improve"
      | "translate" = "chat",
    files: File[] = [],
    notes?: Array<{ id: string; title: string; content?: string }>
  ) => {
    const userMessage = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: new Date(),
      files: files
    };

    // Tạo context từ selected notes
    const context =
      notes && notes.length > 0
        ? notes
            .map((note) => {
              const noteContent = note.content || "";
              return `=== Note: ${note.title} ===\n${noteContent}`;
            })
            .join("\n\n---\n\n")
        : undefined;

    setChats((prev) => {
      const updated = prev.map((chat) => {
        if (chat.id === selectedChatId) {
          const newMessages = [...chat.messages, userMessage];
          const newTitle =
            chat.messages.length === 0
              ? text.length > 30
                ? text.substring(0, 30) + "..."
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
      // Gọi API với context nếu có
      const response = await apiService.sendMessage({
        message: text,
        action,
        context,
        files: files
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
      console.error("Error sending message:", err);
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Không thể kết nối đến server. Vui lòng thử lại sau.";
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
      <div
        className={`flex flex-col flex-1 h-full transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        } ${isHistoryOpen ? "mr-80" : ""}`}
      >
        <Header
          onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
          onTogglePersonalise={() => console.log("Open Personalise panel")}
          currentChat={selectedChat?.title}
          hasMessages={hasMessages}
          collapsed={sidebarCollapsed}
        />

        <ChatArea
          messages={selectedChat?.messages || []}
          isTyping={isTyping}
          hasMessages={hasMessages}
        />
        <InputArea
          onSendMessage={(text, action, files, notes) =>
            handleSendMessage(text, action || "chat", files || [], notes)
          }
          disabled={isTyping}
          hasMessages={hasMessages}
        />
      </div>
    </div>
  );
};

export default ChatPage;
