import React, { useState } from "react";
import { X, Search, Trash2, MessageSquare, Plus } from "lucide-react";
import { Chat } from "./sidebar";

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    chats: Chat[];
    onSelectChat: (id: number) => void;
    onDeleteChat: (id: number) => void;
    onNewChat: () => void;
    selectedChatId: number;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
    isOpen,
    onClose,
    chats,
    onSelectChat,
    onDeleteChat,
    onNewChat,
    selectedChatId,
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChats = chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full bg-white border-l border-gray-200 w-80 z-50 shadow-lg">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Chat history</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* New chat button */}
                <div className="p-4 border-b border-gray-200">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-300 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Plus size={18} />
                        <span>New chat</span>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search chats"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                {/* Chat list */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="text-sm text-gray-500 mb-2">Chats</div>
                    {filteredChats.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-8">
                            {searchQuery ? "No chats found" : "No chat history"}
                        </div>
                    ) : (
                        filteredChats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-colors group ${
                                    selectedChatId === chat.id ? "bg-gray-100" : "hover:bg-gray-50"
                                }`}
                                onClick={() => onSelectChat(chat.id)}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <MessageSquare size={18} className="text-gray-400" />
                                    <span className="text-gray-700 truncate">{chat.title}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                                >
                                    <Trash2 size={16} className="text-gray-500" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPanel;

