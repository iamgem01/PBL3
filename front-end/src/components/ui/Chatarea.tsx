import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import Message from "./Message";
import TypingText from "./Typingtext";
import FadeInText from "./Fadeintext";
import type { MessageItem } from "./sidebar";

interface ChatAreaProps {
    messages: MessageItem[];
    isTyping: boolean;
    hasMessages?: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isTyping }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white relative min-w-0 min-h-0 z-0 w-full">
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full w-full relative overflow-hidden">
                    <div className="relative w-full h-full max-w-full flex items-center justify-center">

                        {/* Blobs */}
                        <div className="absolute w-48 h-48 md:w-64 md:h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob-slow top-1/3 left-[20%] -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute w-48 h-48 md:w-64 md:h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob-slow animation-delay-2000 top-1/2 right-[20%] translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute w-40 h-40 md:w-56 md:h-56 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob-slow animation-delay-4000 bottom-1/3 left-[30%] -translate-x-1/2 translate-y-1/2" />

                        {/* Text center */}
                        <div className="relative z-10 text-center px-4">
                            <div className="text-4xl font-bold font-gabarito bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                <TypingText text="What's on your mind? " />
                            </div>

                            <div className="text-gray-500 mt-4">
                                <FadeInText text="Start a new conversation or ask anything." />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (

                <div className="pb-4 w-full min-w-0">
                    {messages.map((msg) => (
                        <Message key={msg.id} message={msg} isUser={msg.isUser} />
                    ))}
                    {isTyping && (
                        <div className="group w-full min-w-0">
                            <div className="max-w-3xl mx-auto px-4 py-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                                            <Sparkles size={18} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex gap-1 items-center">
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
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>
    );
};

export default ChatArea;