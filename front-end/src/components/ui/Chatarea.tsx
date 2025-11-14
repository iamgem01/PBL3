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
    <div className="flex-1 overflow-y-auto bg-white relative">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="">
            <div className="absolute w-50 h-50 md:w-56 md:h-56 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob-slow top-1/3 left-1/4" />
            <div className="absolute w-50 h-50 md:w-60 md:h-60 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob-slow animation-delay-2000 top-1/2 right-1/4" />
            <div className="absolute w-50 h-50 md:w-52 md:h-52 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob-slow animation-delay-4000 bottom-1/3 left-1/3" />

            <div className="relative z-10 text-center px-4">
              <h2 className="text-4xl font-bold font-gabarito bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                <TypingText text="What's on your mind? " />
              </h2>
              {/* SỬA Ở ĐÂY: Thay thế <p> bằng <div> */}
              <div className="text-gray-500">
                <FadeInText text="Start a new conversation or ask anything." />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pb-4">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} isUser={msg.isUser} />
          ))}
          {isTyping && (
            <div className="group w-full">
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