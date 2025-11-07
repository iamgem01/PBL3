"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "../../lib/utils";
import {
    ImageIcon, FileUp, MonitorIcon, Paperclip, SendIcon, XIcon,
    LoaderIcon, Sparkles, Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

interface UseAutoResizeTextareaProps { minHeight: number; maxHeight?: number; }

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = useCallback((reset = false) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        if (reset) {
            textarea.style.height = "auto";
            textarea.style.height = `${minHeight}px`;
            return;
        }
        textarea.style.height = "auto";
        const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Infinity));
        textarea.style.height = `${newHeight}px`;
    }, [minHeight, maxHeight]);

    useEffect(() => { adjustHeight(); }, []);
    return { textareaRef, adjustHeight };
}

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, value, onChange, ...props }, ref) => {
        const [focused, setFocused] = React.useState(false);
        return (
            <div className="relative">
        <textarea
            className={cn("chat-input", className)}
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
        />
                {focused && <motion.span className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-violet-500/30" layoutId="ring" />}
                {onChange && <div className="absolute bottom-3 right-3 w-2 h-2 bg-violet-500 rounded-full animate-ripple opacity-0" />}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

export function Chatbox() {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);

    const commandSuggestions = [
        { icon: <ImageIcon className="w-4 h-4" />, label: "Clone UI", prefix: "/clone" },
        { icon: <FileUp className="w-4 h-4" />, label: "Quick Note", prefix: "/fileup" },
        { icon: <MonitorIcon className="w-4 h-4" />, label: "Create Page", prefix: "/page" },
        { icon: <Sparkles className="w-4 h-4" />, label: "Improve", prefix: "/improve" },
    ];

    useEffect(() => {
        setShowCommandPalette(value.startsWith("/") && !value.includes(" "));
        if (value.startsWith("/") && !value.includes(" ")) {
            const match = commandSuggestions.findIndex(cmd => cmd.prefix.startsWith(value));
            setActiveSuggestion(match >= 0 ? match : -1);
        }
    }, [value]);

    useEffect(() => {
        const handleMouse = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMouse);
        return () => window.removeEventListener("mousemove", handleMouse);
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (commandPaletteRef.current && !commandPaletteRef.current.contains(e.target as Node)) {
                setShowCommandPalette(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === "ArrowDown") { e.preventDefault(); setActiveSuggestion(p => (p + 1) % commandSuggestions.length); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActiveSuggestion(p => p === 0 ? commandSuggestions.length - 1 : p - 1); }
            else if (["Enter", "Tab"].includes(e.key) && activeSuggestion >= 0) {
                e.preventDefault();
                const cmd = commandSuggestions[activeSuggestion];
                setValue(cmd.prefix + " ");
                setShowCommandPalette(false);
                setRecentCommand(cmd.label);
                setTimeout(() => setRecentCommand(null), 2000);
            } else if (e.key === "Escape") setShowCommandPalette(false);
        } else if (e.key === "Enter" && !e.shiftKey && value.trim()) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        if (!value.trim()) return;
        setIsTyping(true);
        setValue("");
        adjustHeight(true);
        setTimeout(() => setIsTyping(false), 3000);
    };

    const handleAttachFile = () => {
        setAttachments(prev => [...prev, `file-${Math.floor(Math.random() * 1000)}.pdf`]);
    };

    const removeAttachment = (i: number) => {
        setAttachments(prev => prev.filter((_, idx) => idx !== i));
    };

    const selectCommand = (i: number) => {
        const cmd = commandSuggestions[i];
        setValue(cmd.prefix + " ");
        setShowCommandPalette(false);
        setRecentCommand(cmd.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    return (
        <div className="chatbox-container">
            <div className="chatbox-bg">
                <div></div><div></div><div></div>
            </div>

            <div className="w-full max-w-2xl mx-auto relative">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div>
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                   className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                            How can I help today?
                        </motion.h1>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-gray-400">
                            Type a command or ask a question
                        </motion.p>
                    </div>

                    <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="chatbox-card">
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div ref={commandPaletteRef} className="command-palette" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                                    <div className="flex flex-wrap gap-2 p-2">
                                        {commandSuggestions.map((s, i) => (
                                            <motion.div key={s.prefix}
                                                        className={cn("command-item", activeSuggestion === i ? "command-item-active" : "command-item-inactive")}
                                                        onClick={() => selectCommand(i)}
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                                {s.icon}
                                                <div className="font-medium">{s.label}</div>
                                                <div className="text-white/40 text-xs ml-1">{s.prefix}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-6">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Ask, search, or make anything..."
                                className="min-h-[60px]"
                            />
                        </div>

                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div className="px-6 pb-4 flex gap-3 flex-wrap" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                    {attachments.map((file, i) => (
                                        <motion.div key={i} className="attachment-tag" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                            <span>{file}</span>
                                            <button onClick={() => removeAttachment(i)} className="text-white/40 hover:text-white"><XIcon className="w-3 h-3" /></button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <motion.button whileTap={{ scale: 0.94 }} onClick={handleAttachFile} className="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors"><Paperclip className="w-4 h-4" /></motion.button>
                                <motion.button whileTap={{ scale: 0.94 }} onClick={() => setShowCommandPalette(p => !p)} className={cn("p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors", showCommandPalette && "bg-white/10 text-white/90")}><Command className="w-4 h-4" /></motion.button>
                                <ActionButton icon={<Sparkles className="w-4 h-4 text-violet-400"/>} label="Magic"/>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                onClick={handleSendMessage}
                                disabled={isTyping || !value.trim()}
                                className={cn("btn-send", value.trim() ? "btn-send-enabled" : "btn-send-disabled")}
                            >
                                {isTyping ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                                <span>{isTyping ? "Sending..." : "Send"}</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {commandSuggestions.map((s, i) => (
                            <motion.button key={s.prefix} onClick={() => selectCommand(i)} className="suggestion-btn"
                                           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                {s.icon}<span>{s.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isTyping && (
                    <motion.div className="fixed bottom-8 left-1/2 -translate-x-1/2 backdrop-blur-2xl bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05]"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-7 rounded-full bg-white/[0.05] flex items-center justify-center"><span className="text-xs font-medium text-white/90">AI</span></div>
                            <div className="flex items-center gap-2 text-sm text-white/70"><span>Thinking</span><TypingDots /></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {recentCommand && (
                    <motion.div className="recent-command" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                        Đã chọn lệnh: {recentCommand}
                    </motion.div>
                )}
            </AnimatePresence>

            {inputFocused && (
                <motion.div className="mouse-glow"
                            style={{ left: mousePosition.x - 400, top: mousePosition.y - 400 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1 space-x-1">
            {[0, 1, 2].map(i => <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />)}
        </div>
    );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
            onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
            className="action-btn"
        >
            <div className="relative z-10 flex items-center gap-2">{icon}<span className="text-xs">{label}</span></div>
            {hovered && <div className="action-btn-hover" />}
            <span className="action-btn-underline" />
        </motion.button>
    );
}