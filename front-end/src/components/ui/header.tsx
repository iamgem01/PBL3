import React from "react";
import { Edit3, Clock } from "lucide-react";

interface HeaderProps {
  onToggleHistory: () => void;
  onTogglePersonalise?: () => void;
  currentChat?: string;
  hasMessages?: boolean;
  collapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onToggleHistory,
  onTogglePersonalise,
  currentChat,
  hasMessages,
  collapsed,
}) => {
  return (
    <header
      className={`fixed top-0 right-0 z-20 flex items-center font-inter justify-between h-14 px-6 border-b border-gray-200 bg-white/80 backdrop-blur-md transition-all duration-300
        ${collapsed  ? "left-[6.25rem] w-[calc(100%-6.25rem)]" : "left-[14.5rem] w-[calc(100%-14.5rem)]"}`}
    >
      {/* Left side: Logo / Chat title */}
      <div className="flex items-center gap-3 transition-all duration-300">
        <button
          onClick={onToggleHistory}
          className="p-2 flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          title="Chat history"
        >
          <Clock size={20} />
        </button>
        <div
          className={`rounded-full bg-gradient-to-br from-purple-400 to-blue-400 transition-all duration-300 ${
            hasMessages ? "w-3 h-3" : "w-5 h-5"
          }`}
        />
        {hasMessages ? (
          <span className="text-gray-700 font-medium animate-fadeIn">
            {currentChat || "Greeting"}
          </span>
        ) : (
          <span className="font-bold font-gabarito text-gray-800">ChatAI</span>
        )}
      </div>

      {/* Right side: Buttons */}
      <div className="flex items-center gap-2">
        {!hasMessages && onTogglePersonalise && (
          <button
            onClick={onTogglePersonalise}
            className="p-2 flex items-center gap-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            title="Personalise"
          >
            <Edit3 size={20} />
            <span className="text-sm font-medium">Personalise</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
