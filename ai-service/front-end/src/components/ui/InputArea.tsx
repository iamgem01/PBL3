import React, { useState } from "react";
import { Send, Paperclip, MessageSquare } from "lucide-react";

interface InputAreaProps {
    onSendMessage: (text: string) => void;
    disabled?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState("");
    const [showQuickActions, setShowQuickActions] = useState(true);

    const handleSubmit = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage("");
            setShowQuickActions(false);
        }
    };

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
                {showQuickActions && (
                    <div className="flex gap-2 mb-3">
                        <button className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <MessageSquare size={14} />
                            Quick Note
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                            🎯 Aim 2025
                        </button>
                    </div>
                )}

                <div className="relative">
                    <div className="flex items-end gap-2 p-3 border-2 border-blue-300 rounded-2xl bg-white focus-within:border-blue-400 transition-colors">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Paperclip size={20} className="text-gray-500" />
                        </button>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask, search, or make anything..."
                            className="flex-1 resize-none outline-none max-h-32 text-gray-800"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            disabled={disabled}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={!message.trim() || disabled}
                            className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputArea;