import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { User, Bot } from "lucide-react";
import { MessageItem } from "./sidebar";

interface MessageProps {
    message: MessageItem;
    isUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isUser }) => {
    return (
        <div className={`group w-full ${isUser ? "bg-white" : "bg-gray-50"}`}>
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${isUser ? "order-2" : ""}`}>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isUser
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                        >
                            {isUser ? (
                                <User size={18} />
                            ) : (
                                <Bot size={18} />
                            )}
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 min-w-0 ${isUser ? "text-right" : ""}`}>
                        <div
                            className={`prose prose-sm max-w-none ${
                                isUser
                                    ? "prose-invert"
                                    : "prose-gray"
                            }`}
                        >
                            {isUser ? (
                                <div className="text-gray-800 whitespace-pre-wrap break-words">
                                    {message.text}
                                </div>
                            ) : (
                                <div className="text-gray-800 markdown-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        components={{
                                            p: ({ children }) => (
                                                <p className="mb-4 last:mb-0 leading-7">
                                                    {children}
                                                </p>
                                            ),
                                            h1: ({ children }) => (
                                                <h1 className="text-2xl font-bold mb-3 mt-6 first:mt-0">
                                                    {children}
                                                </h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="text-xl font-bold mb-2 mt-5 first:mt-0">
                                                    {children}
                                                </h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">
                                                    {children}
                                                </h3>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="list-disc pl-6 mb-4 space-y-1">
                                                    {children}
                                                </ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="list-decimal pl-6 mb-4 space-y-1">
                                                    {children}
                                                </ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="leading-7">{children}</li>
                                            ),
                                            code: ({ inline, className, children, ...props }: any) => {
                                                const match = /language-(\w+)/.exec(className || "");
                                                return !inline && match ? (
                                                    <pre className="mb-4">
                                                        <code
                                                            className={`hljs language-${match[1]} text-sm`}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    </pre>
                                                ) : (
                                                    <code
                                                        className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800"
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600">
                                                    {children}
                                                </blockquote>
                                            ),
                                            a: ({ children, href }) => (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                            strong: ({ children }) => (
                                                <strong className="font-semibold">{children}</strong>
                                            ),
                                            em: ({ children }) => (
                                                <em className="italic">{children}</em>
                                            ),
                                        }}
                                    >
                                        {message.text}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;