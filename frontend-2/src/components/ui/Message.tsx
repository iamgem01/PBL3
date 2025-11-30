import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw"; 
import { Sparkles, Copy, RotateCw, File, FileText } from "lucide-react";
import type { MessageItem } from "./sidebar";

interface MessageProps {
    message: MessageItem;
    isUser: boolean;
    onRepeat?: (text: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, isUser, onRepeat }) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Function để clean HTML tags và chỉ giữ nội dung
    const cleanHtmlContent = (text: string): string => {
        // Remove HTML tags nhưng giữ nội dung
        return text
            .replace(/<h3>/g, '\n### ')
            .replace(/<\/h3>/g, '\n')
            .replace(/<p>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<strong>/g, '**')
            .replace(/<\/strong>/g, '**')
            .replace(/<em>/g, '*')
            .replace(/<\/em>/g, '*')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
            .trim();
    };

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
                            <div className="text-gray-700 bg-gray-100 rounded-xl p-3 max-w-[80%] ml-auto break-words">
                                {message.text && (
                                    <div className="mb-2 last:mb-0">{message.text}</div>
                                )}

                                {message.attachments && message.attachments.length > 0 && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        {message.attachments.map((file, index) => (
                                            <a
                                                key={index}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                            >
                                                <File size={16} className="text-blue-600 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-gray-800 font-medium truncate">
                                                        {file.name}
                                                    </div>
                                                    {file.size && (
                                                        <div className="text-xs text-gray-500">
                                                            {formatFileSize(file.size)}
                                                        </div>
                                                    )}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Context/Files indicators */}
                                {(message.contextUsed || message.notesUsed || message.filesUsed) && (
                                    <div className="mb-3 space-y-2">
                                        {message.filesUsed && message.filesUsed.length > 0 && (
                                            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
                                                <div className="font-medium mb-1 flex items-center gap-1">
                                                    <File size={14} className="text-blue-600" />
                                                    Dựa trên {message.filesUsed.length} file đã gửi:
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {message.filesUsed.map((file, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs"
                                                        >
                                                            <File size={12} className="text-blue-600" />
                                                            <span className="font-medium truncate max-w-[150px]">
                                                                {file.name}
                                                            </span>
                                                            {file.size && (
                                                                <span className="text-gray-500">
                                                                    ({formatFileSize(file.size)})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {message.notesUsed && message.notesUsed.length > 0 && (
                                            <div className="text-sm text-gray-600 bg-purple-50 border border-purple-200 rounded-lg p-2">
                                                <div className="font-medium mb-1 flex items-center gap-1">
                                                    <FileText size={14} className="text-purple-600" />
                                                    {message.contextUsed || `Đã sử dụng ${message.notesUsed.length} ghi chú:`}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {message.notesUsed.map((note, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-purple-200 rounded text-xs"
                                                        >
                                                            <FileText size={12} className="text-purple-600" />
                                                            <span className="font-medium">{note.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* AI Response - Clean and render as Markdown */}
                                <div className="markdown-content text-gray-800 break-words max-w-[80%]">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                        components={{
                                            p: ({ children }) => (
                                                <p className="mb-3 leading-7">{children}</p>
                                            ),
                                            h1: ({ children }) => (
                                                <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="text-lg font-semibold mb-2 mt-4">
                                                    {children}
                                                </h3>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="leading-7">{children}</li>
                                            ),
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3 text-gray-700">
                                                    {children}
                                                </blockquote>
                                            ),
                                            code: ({ inline, className, children, ...props }: any) => {
                                                const match = /language-(\w+)/.exec(className || "");
                                                return !inline && match ? (
                                                    <pre className="mb-3 rounded-lg bg-gray-900 text-white p-4 overflow-x-auto">
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
                                            strong: ({ children }) => (
                                                <strong className="font-semibold text-gray-900">{children}</strong>
                                            ),
                                            em: ({ children }) => (
                                                <em className="italic">{children}</em>
                                            ),
                                        }}
                                    >
                                        {cleanHtmlContent(message.text)}
                                    </ReactMarkdown>
                                </div>
                            </>
                        )}

                        {/* Action buttons */}
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