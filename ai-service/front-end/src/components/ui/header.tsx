import React from "react";
import { Menu, Edit3, Clock } from "lucide-react";

interface HeaderProps {
    onToggleSidebar: () => void;
    currentChat?: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, currentChat }) => {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
                    <span className="font-medium text-gray-800">Eternus AI</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{currentChat || "Greeting"}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit3 size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Clock size={18} />
                </button>
            </div>
        </div>
    );
};

export default Header;