import React, { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import Message from "./Message";
import { MessageItem } from "./sidebar";

interface ChatAreaProps {
    messages: MessageItem[];
    isTyping: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isTyping }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const fullText = "What's on your mind today?";
    const [displayedText, setDisplayedText] = React.useState("");

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) clearInterval(interval);
        }, 80);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
                <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
                    {/* Hiệu ứng blob nhỏ, gần chữ */}
                    <div className="absolute w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow top-1/2 left-1/2 -translate-x-[60%] -translate-y-[60%]" />
                    <div className="absolute w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-2000 top-1/2 left-1/2 -translate-x-[20%] -translate-y-[70%]" />
                    <div className="absolute w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-4000 top-1/2 left-1/2 -translate-x-[40%] -translate-y-[40%]" />

                    <h1 className="text-2xl font-medium bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent relative z-10">
                        {displayedText}
                        <span className="border-r-2 border-blue-500 ml-1 animate-blink"></span>
                    </h1>
                </div>

            ) : (
                <>
                    {messages.map((msg) => (
                        <Message key={msg.id} message={msg} isUser={msg.isUser} />
                    ))}
                    {isTyping && (
                        <div className="flex items-start gap-3 mb-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <MessageSquare size={16} />
                                <span>Thought</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "150ms" }}
                                />
                                <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "300ms" }}
                                />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </>
            )}
        </div>
    );
};

export default ChatArea;