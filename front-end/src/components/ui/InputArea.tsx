import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, FileText } from "lucide-react";
import ContextMenu, { type Note } from "./ContextMenu";
import type { UserPreferences } from "../../services/api";

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
    notes?: Note[],
    files?: File[]
  ) => void;
  disabled?: boolean;
  hasMessages?: boolean;
  collapsed?: boolean;
  currentPreferences?: UserPreferences;
}

const QUICK_ACTIONS = [
  { id: "summarize", label: "Tóm tắt" },
  { id: "explain", label: "Giải thích" },
  { id: "translate", label: "Dịch thuật" },
  { id: "improve", label: "Cải thiện văn phong" },
] as const;

const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  disabled,
  hasMessages,
  currentPreferences,
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

  // Log preferences changes (optional - for debugging)
  useEffect(() => {
    if (currentPreferences) {
      console.log("📋 Current preferences in InputArea:", currentPreferences);
    }
  }, [currentPreferences]);

  // 🔍 DEBUG: Log attachedFiles state changes
  useEffect(() => {
    console.log("📎 attachedFiles state changed:", {
      count: attachedFiles.length,
      files: attachedFiles.map((f) => ({ name: f.name, size: f.size })),
    });
  }, [attachedFiles]);

  const handleSubmit = () => {
    // Validate: phải có message hoặc files
    const hasMessage = message.trim().length > 0;
    const hasFiles = attachedFiles.length > 0;

    console.log("🚀 handleSubmit called:", {
      hasMessage,
      hasFiles,
      filesCount: attachedFiles.length,
      message: message.substring(0, 50),
      disabled,
    });

    if ((hasMessage || hasFiles) && !disabled) {
      console.log("✅ Calling onSendMessage with:", {
        message: message.trim(),
        action: selectedAction || "chat",
        notesCount: selectedNotes.length,
        filesCount: attachedFiles.length,
        files: attachedFiles.map((f) => ({ name: f.name, size: f.size })),
      });

      onSendMessage(
        message.trim(),
        selectedAction || "chat",
        selectedNotes,
        hasFiles ? attachedFiles : undefined
      );

      setMessage("");
      setSelectedAction(null);
      setSelectedNotes([]);
      setAttachedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } else {
      console.warn("⚠️ handleSubmit blocked:", {
        hasMessage,
        hasFiles,
        disabled,
      });
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
    console.log("📁 handleFileAttach triggered:", {
      filesSelected: files.length,
      fileNames: files.map((f) => f.name),
    });

    setAttachedFiles((prev) => {
      const newFiles = [...prev, ...files];
      console.log("📎 Setting attachedFiles to:", newFiles.length, "files");
      return newFiles;
    });
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
                onClick={() => {
                  console.log("🖱️ Paperclip button clicked");
                  fileInputRef.current?.click();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700"
                title="Đính kèm file"
              >
                <Paperclip
                  size={20}
                  className="text-gray-500 dark:text-gray-400"
                />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileAttach}
                className="hidden"
                accept="*/*"
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
                disabled={
                  (!message.trim() && attachedFiles.length === 0) || disabled
                }
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
                    <span className="text-primary dark:text-blue-300">
                      {note.title}
                    </span>
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
                    <span className="text-foreground dark:text-gray-200">
                      {file.name}
                    </span>
                    <button
                      onClick={() => {
                        console.log("🗑️ Removing file:", file.name);
                        setAttachedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
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

  return (
    <div className="border-t border-gray-200 bg-white flex-shrink-0 w-full">
      <div className="max-w-3xl mx-auto px-4 py-4 w-full">
        {/* @ Add context button  */}
        <div className="relative mb-2">
          <button
            ref={contextButtonRef}
            onClick={() => setShowContextMenu(!showContextMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedNotes.length > 0
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "text-blue-600 hover:bg-blue-50 border border-transparent"
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

        {message.trim() && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedAction === action.id
                    ? "bg-violet-100 text-violet-700 border border-violet-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
                disabled={disabled}
              >
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
        {attachedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
              >
                <FileText size={14} />
                <span className="text-gray-700">{file.name}</span>
                <button
                  onClick={() => {
                    console.log("🗑️ Removing file:", file.name);
                    setAttachedFiles((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {selectedNotes.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm"
              >
                <FileText size={14} className="text-blue-600" />
                <span className="text-blue-800">{note.title}</span>
                <button
                  onClick={() =>
                    setSelectedNotes((prev) =>
                      prev.filter((n) => n.id !== note.id)
                    )
                  }
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="relative flex items-end gap-2 bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-shadow focus-within:border-gray-400 focus-within:shadow-md dark:bg-gray-800 dark:border-gray-600 dark:hover:shadow-gray-900/50 dark:focus-within:border-gray-500">
          <button
            onClick={() => {
              console.log("🖱️ Paperclip button clicked (compact mode)");
              fileInputRef.current?.click();
            }}
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
            accept="*/*"
          />
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
            disabled={
              (!message.trim() && attachedFiles.length === 0) || disabled
            }
            className="p-2 mr-2 mb-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
            title="Gửi tin nhắn (Enter)"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center dark:text-gray-400">
          Aeternus AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
        </p>
      </div>
    </div>
  );
};

export default InputArea;
