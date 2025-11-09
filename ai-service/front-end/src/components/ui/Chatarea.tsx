import React, { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import Message from "./Message";
import { MessageItem } from "./sidebar";
import TypingText from "./Typingtext";
import FadeInText from "./Fadeintext";

interface ChatAreaProps {
  messages: MessageItem[];
  isTyping: boolean;
}

export default function ChatArea({ messages, isTyping }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const suggestions = [
    { icon: "📄", text: "Analyse notes" },
    { icon: "✍️", text: "Write a new note" },
    { icon: "🖼️", text: "Analyse PDFs or images" },
    { icon: "✅", text: "Create a task tracker" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-white relative flex flex-col items-center px-4 pt-6">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center w-full max-w-3xl gap-4 relative">
          {/* Placeholder chat lớn */}
          <div className="relative w-full flex flex-col items-start">
            {/* Optional Blobs */}
            <div className="absolute w-52 h-52 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob-slow top-1/3 left-1/4" />
            <div className="absolute w-56 h-56 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob-slow animation-delay-2000 top-1/2 right-1/4" />
            <div className="absolute w-52 h-52 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob-slow animation-delay-4000 bottom-1/3 left-1/3" />

            <div className="relative z-10 w-full bg-gray-50 rounded-xl p-4 shadow">
              <TypingText text="What's on your mind?" />
              <FadeInText text="Write down your ideas or browse previous notes" />
            </div>
          </div>

          {/* Suggestions / gợi ý liên quan ghi chú */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {suggestions.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl w-full hover:bg-gray-200 cursor-pointer transition-colors"
              >
                <span>{item.icon}</span>
                <span className="text-gray-700 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="w-full max-w-3xl flex flex-col gap-2 pb-4">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} isUser={msg.isUser} />
          ))}

          {isTyping && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 w-full">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
