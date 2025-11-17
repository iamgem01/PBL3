import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Sparkles, Copy, RotateCw } from "lucide-react";
import type { MessageItem } from "./sidebar";

interface MessageProps {
    message: MessageItem;
    isUser: boolean;
    onRepeat?: (text: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, isUser, onRepeat }) => {
    return (
        <div className="w-full">
            <div className="max-w-3xl mx-auto px-4 py-2">
                <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>

                    {!isUser && (
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-700">
                                <Sparkles className="text-blue-500" size={18} />
                            </div>
                        </div>
                    )}

                    <div className="flex-1 min-w-0 relative group">
                        {/* USER MESSAGE */}
                        {isUser ? (
                            <div className="relative">
                                <div className="text-gray-700 bg-gray-100 rounded-xl p-3 max-w-[80%] ml-auto break-words">
                                    {message.text}
                                </div>

                                {/* 🔥 Attachments nằm dưới bên phải message */}
                                {message.attachments && message.attachments.length > 0 && (
                                    <div className="flex justify-end mt-2">
                                        <div className="flex flex-col gap-2 max-w-[80%]">
                                            {message.attachments.map((file, index) => (
                                                <a
                                                    key={index}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-blue-700 hover:bg-gray-200 transition-colors"
                                                >
                                                    📎 {file.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* AI MESSAGE */}
                                <div className="markdown-content text-gray-800 break-words max-w-[80%]">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        components={{
                                            p: ({ children }) => (
                                                <p className="mb-2 leading-6">{children}</p>
                                            ),
                                            h1: ({ children }) => (
                                                <h1 className="text-2xl font-bold mb-2">{children}</h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="text-xl font-bold mb-2">{children}</h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="text-lg font-semibold mb-1">
                                                    {children}
                                                </h3>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="list-disc pl-6 mb-2">{children}</ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="list-decimal pl-6 mb-2">{children}</ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="leading-6">{children}</li>
                                            ),
                                            code: ({ inline, className, children, ...props }: any) => {
                                                const match = /language-(\w+)/.exec(className || "");
                                                return !inline && match ? (
                                                    <pre className="mb-2 rounded-lg bg-gray-900 text-white p-2 overflow-x-auto">
                                                        <code
                                                            className={`hljs language-${match[1]}`}
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
                                        }}
                                    >
                                        {message.text}
                                    </ReactMarkdown>

                                    {/* 🔥 Attachments nằm dưới bên phải message (cho AI) */}
                                    {message.attachments && message.attachments.length > 0 && (
                                        <div className="flex justify-end mt-2">
                                            <div className="flex flex-col gap-2 max-w-[80%]">
                                                {message.attachments.map((file, index) => (
                                                    <a
                                                        key={index}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-blue-700 hover:bg-gray-200 transition-colors"
                                                    >
                                                        📎 {file.name}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* COPY / REPEAT BUTTONS */}
                        {!isUser && (
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={() => navigator.clipboard.writeText(message.text)}
                                    className="p-1 rounded hover:bg-gray-200 text-gray-600"
                                    title="Copy"
                                >
                                    <Copy size={16} />
                                </button>

                                {onRepeat && (
                                    <button
                                        onClick={() => onRepeat(message.text)}
                                        className="p-1 rounded hover:bg-gray-200 text-gray-600"
                                        title="Regenerate"
                                    >
                                        <RotateCw size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;