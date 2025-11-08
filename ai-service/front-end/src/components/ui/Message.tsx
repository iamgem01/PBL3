import React from "react";
import { MessageSquare } from "lucide-react";
import { MessageItem } from "./sidebar";

interface MessageProps {
    message: MessageItem;
    isUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isUser }) => {
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
            {!isUser && (
                <div className="flex items-start gap-3 max-w-3xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <MessageSquare size={16} />
                        <span>Thought</span>
                    </div>
                </div>
            )}
            <div className={`max-w-3xl ${isUser ? "ml-auto" : ""}`}>
                <div
                    className={`p-3 rounded-lg ${
                        isUser
                            ? "bg-gray-200 text-gray-800"
                            : "bg-transparent text-gray-800"
                    }`}
                >
                    {message.text}
                </div>
            </div>
        </div>
    );
};

export default Message;