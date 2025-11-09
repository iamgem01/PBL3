import React, { useState } from "react";
import { Plus, Search, Trash2, MessageSquare } from "lucide-react";

export interface Chat {
    id: number;
    title: string;
    messages: MessageItem[];
}

export interface MessageItem {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
}


interface SidebarProps {
    isOpen: boolean;
    chats: Chat[];
    onSelectChat: (id: number) => void;
    onDeleteChat: (id: number) => void;
    onNewChat: () => void;
    selectedChatId: number;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             isOpen,
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

    return (
        <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-[width] duration-300 z-50 ${
          isOpen ? "w-64" : "w-0 pointer-events-none opacity-0"
        } overflow-hidden`} >
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-800 mb-3">Chat history</h2>
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-300 text-white rounded-lg hover:opacity-90 transition-opacity mb-3"
                    >
                        <Plus size={18} />
                        <span>New chat</span>
                    </button>

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
                            className="w-full pl-10 pr-4 py-2 bg-blue-500 text-white placeholder-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="text-sm text-gray-500 mb-2">Chats</div>
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-colors group ${
                                selectedChatId === chat.id ? "bg-gray-100" : "hover:bg-gray-50"
                            }`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-gray-800 font-medium truncate">{chat.title}</span>
                            {chat.messages.length > 0 && (
                                <span className="text-gray-400 text-xs truncate">
                                {chat.messages[chat.messages.length - 1].text}
                                </span>
                            )}
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;