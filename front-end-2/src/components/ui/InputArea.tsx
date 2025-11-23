import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, FileText } from "lucide-react";
import ContextMenu, { type Note } from "./ContextMenu";

interface InputAreaProps {
  onSendMessage: (
    text: string,
    action?:
      | "chat"
      | "summarize"
      | "note"
      | "explain"
      | "improve"
      | "translate",
    files?: File[],
    notes?: Note[]
  ) => void;
  disabled?: boolean;
  hasMessages?: boolean;
}

const QUICK_ACTIONS = [
  { id: "summarize", label: "Tóm tắt" },
  { id: "explain", label: "Giải thích" },
  { id: "translate", label: "Dịch thuật" },
] as const;

const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  disabled,
  hasMessages,
}) => {
  const [message, setMessage] = useState("");
  const [selectedAction, setSelectedAction] = useState<
    "chat" | "summarize" | "note" | "explain" | "improve" | "translate" | null
  >(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message, selectedAction || "chat", attachedFiles, selectedNotes);
      setMessage("");
      setSelectedAction(null);
      setSelectedNotes([]); // Reset selected notes after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleQuickAction = (actionId: string) => {
    setSelectedAction(actionId as "summarize" | "explain" | "translate");
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNotes((prev) => {
      const isAlreadySelected = prev.some((n) => n.id === note.id);
      if (isAlreadySelected) {
        return prev.filter((n) => n.id !== note.id);
      } else {
        return [...prev, note];
      }
    });
  };

  if (!hasMessages) {
    return (
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 transition-all duration-300">
        <div className="w-full max-w-4xl relative">
          {/* Hộp thoại chat lớn */}
          <div
            className="relative flex flex-col gap-4 rounded-2xl border border-blue-200/70
                            bg-gradient-to-br from-gray-50 to-gray-100 shadow-md p-6
                            transition-all duration-300 hover:shadow-lg focus-within:border-blue-400 focus-within:shadow-[0_0_10px_#60a5fa]
                            dark:border-blue-800/50 dark:from-gray-800 dark:to-gray-900 dark:shadow-gray-900/30"
          >
            <div className="relative mb-3">
              <button
                ref={contextButtonRef}
                onClick={() => setShowContextMenu(!showContextMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedNotes.length > 0
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-primary hover:bg-primary/5"
                }`}
              >
                <span>@ Add context</span>
                {selectedNotes.length > 0 && (
                  <span className="bg-blue-700 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {selectedNotes.length}
                  </span>
                )}
              </button>
              <ContextMenu
                isOpen={showContextMenu}
                onClose={() => setShowContextMenu(false)}
                onSelectNote={handleSelectNote}
                selectedNotes={selectedNotes}
              />
            </div>

            {/* Input area lớn */}
            <div
              className="relative flex items-end gap-2 rounded-xl border border-border/70 bg-card/70 
                                   transition-all duration-300 focus-within:border-primary/30 focus-within:shadow-md
                                   dark:border-gray-600 dark:bg-gray-800/70 dark:focus-within:border-primary/50"
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700"
                title="Đính kèm file"
              >
                <Paperclip size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileAttach}
                className="hidden"
              />

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask, search or make anything..."
                className="flex-1 resize-none outline-none text-foreground py-4 px-3 bg-transparent text-lg transition-all duration-300 dark:text-gray-100"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={disabled}
                style={{ minHeight: "80px" }}
              />

              <button
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 mr-1 dark:bg-blue-700 dark:hover:bg-blue-600"
                title="Gửi tin nhắn (Enter)"
              >
                <Send size={20} />
              </button>
            </div>

            {/* Selected notes */}
            {selectedNotes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm dark:bg-primary/20 dark:border-primary/30"
                  >
                    <FileText size={14} className="text-primary" />
                    <span className="text-primary dark:text-blue-300">{note.title}</span>
                    <button
                      onClick={() =>
                        setSelectedNotes((prev) =>
                          prev.filter((n) => n.id !== note.id)
                        )
                      }
                      className="text-primary hover:text-primary/80 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Attached files */}
            {attachedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm dark:bg-gray-700"
                  >
                    <FileText size={14} className="dark:text-gray-300" />
                    <span className="text-foreground dark:text-gray-200">{file.name}</span>
                    <button
                      onClick={() =>
                        setAttachedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Khi đã có message, hiển thị input area nhỏ ở dưới
  return (
    <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
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
                    ? "bg-primary/10 text-primary border border-primary/30 dark:bg-primary/20 dark:border-primary/40"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                }`}
                disabled={disabled}
              >
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-shadow focus-within:border-gray-400 focus-within:shadow-md dark:bg-gray-800 dark:border-gray-600 dark:hover:shadow-gray-900/50 dark:focus-within:border-gray-500">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2 mb-2 dark:hover:bg-gray-700"
            title="Đính kèm file"
          >
            <Paperclip size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileAttach}
            className="hidden"
          />

          <div className="relative mb-2">
            <button
              onClick={() => setShowContextMenu(!showContextMenu)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedNotes.length > 0
                  ? "bg-primary/10 text-primary border border-primary/30 dark:bg-primary/20 dark:border-primary/40"
                  : "text-primary hover:bg-primary/5 dark:text-blue-400 dark:hover:bg-blue-900/30"
              }`}
            >
              @ Add context
              {selectedNotes.length > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs px-1 rounded dark:bg-blue-700">
                  {selectedNotes.length}
                </span>
              )}
            </button>
            <ContextMenu
              isOpen={showContextMenu}
              onClose={() => setShowContextMenu(false)}
              onSelectNote={handleSelectNote}
              selectedNotes={selectedNotes}
            />
          </div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 resize-none outline-none max-h-32 text-gray-800 py-3 px-1 bg-transparent dark:text-gray-200"
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
            className="p-2 mr-2 mb-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
            title="Gửi tin nhắn (Enter)"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center dark:text-gray-400">
          SmartNotes AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
        </p>
      </div>
    </div>
  );
};

export default InputArea;