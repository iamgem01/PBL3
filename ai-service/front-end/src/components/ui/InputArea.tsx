import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";

interface InputAreaProps {
    onSendMessage: (text: string, action?: 'chat' | 'summarize' | 'note' | 'explain' | 'improve' | 'translate') => void;
    disabled?: boolean;
}

const QUICK_ACTIONS = [
    { id: 'summarize', label: 'Tóm tắt', icon: '📝' },
    { id: 'explain', label: 'Giải thích', icon: '💡' },
    { id: 'translate', label: 'Dịch thuật', icon: '🌐' },
] as const;

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState("");
    const [selectedAction, setSelectedAction] = useState<'chat' | 'summarize' | 'note' | 'explain' | 'improve' | 'translate' | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message, selectedAction || 'chat');
            setMessage("");
            setSelectedAction(null);
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleQuickAction = (actionId: string) => {
        setSelectedAction(actionId as 'summarize' | 'explain' | 'translate');
        textareaRef.current?.focus();
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    return (
        <div className="border-t border-gray-200 bg-white">
            <div className="max-w-3xl mx-auto px-4 py-4">
                {/* Quick Actions */}
                {message.trim() && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleQuickAction(action.id)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                                    selectedAction === action.id
                                        ? 'bg-violet-100 text-violet-700 border border-violet-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                }`}
                                disabled={disabled}
                            >
                                <span>{action.icon}</span>
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative flex items-end gap-2 bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-shadow focus-within:border-gray-400 focus-within:shadow-md">
                    <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2 mb-2"
                        title="Đính kèm file"
                    >
                        <Paperclip size={18} className="text-gray-500" />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 resize-none outline-none max-h-32 text-gray-800 py-3 px-1 bg-transparent"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        disabled={disabled}
                        style={{ minHeight: "24px", maxHeight: "200px" }}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!message.trim() || disabled}
                        className="p-2 mr-2 mb-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
                        title="Gửi tin nhắn (Enter)"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    SmartNotes AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
                </p>
            </div>
        </div>
    );
};

export default InputArea;