import { useState, useEffect, useCallback, useRef } from "react";
import type { Note } from "./documentTypes";

interface DocumentContentProps {
  note: Note | null;
  isUpdating: boolean;
  onUpdateContent: (content: string) => void;
  onShowToolbar: (position: { x: number; y: number }) => void;
}

export const PlainTextContent = ({
  note,
  isUpdating,
  onUpdateContent,
  onShowToolbar,
}: DocumentContentProps) => {
  const [currentContent, setCurrentContent] = useState(note?.content || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync content when prop changes
  useEffect(() => {
    setCurrentContent(note?.content || "");
  }, [note?.content]);

  // Auto-save khi content thay đổi
  useEffect(() => {
    if (currentContent !== (note?.content || "")) {
      const timeoutId = setTimeout(() => {
        onUpdateContent(currentContent);
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [currentContent, note?.content, onUpdateContent]);

  // Selection và toolbar
  const handleTextSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText.length > 0) {
      // Get textarea bounding rect
      const textareaRect = textarea.getBoundingClientRect();
      
      // Calculate approximate position based on selection
      const lines = textarea.value.substring(0, start).split('\n');
      const lineNumber = lines.length - 1;
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
      
      // Calculate Y position based on line number and scroll position
      const yOffset = (lineNumber * lineHeight) - textarea.scrollTop;
      
      // Position toolbar above the selection
      onShowToolbar({
        x: textareaRect.left / 2 + window.scrollX - 20,
        y: textareaRect.top + window.scrollY + yOffset - 60,
      });
    } else {
      // Hide toolbar when no text is selected
      onShowToolbar({ x: 0, y: 0 });
    }
  }, [onShowToolbar]);

  return (
    <div className="max-w-4xl mx-auto backdrop-blur-sm">
      <div className="bg-white/70 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Note Content</h3>

          {/* Save Status Indicator */}
          <div className="flex items-center gap-2">
            {isUpdating && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          <textarea
            ref={textareaRef}
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            onSelect={handleTextSelection}
            placeholder="Start writing your note..."
            className="w-full min-h-[400px] text-gray-700 placeholder-gray-400 border-none outline-none focus:ring-0 p-0 resize-none font-mono text-sm leading-6"
            style={{
              lineHeight: "1.5",
              tabSize: 4,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
            spellCheck={false}
          />

          {/* Footer info */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <div>
              Lines: {currentContent.split("\n").length} | Characters:{" "}
              {currentContent.length} | Words:{" "}
              {currentContent.trim()
                ? currentContent.trim().split(/\s+/).length
                : 0}
            </div>
            <div>Auto-saved • Ctrl+S to save manually</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StructuredNoteRenderer = ({ content }: { content: any }) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-gabarito bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          {content.title || "Travel Planner"}
        </h1>
        <p className="text-gray-500">{content.subtitle || "Packing list"}</p>
      </div>

      <div className="space-y-6">
        {content.sections?.map((section: any, index: number) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">{section.title}</h3>
            <div className="space-y-2">
              {section.items?.map((item: any, itemIndex: number) => (
                <div key={itemIndex} className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NoteStructuredContent = ({ content }: { content: string }) => {
  try {
    const parsedContent = JSON.parse(content);
    return <StructuredNoteRenderer content={parsedContent} />;
  } catch {
    // For now, return null - will be handled by parent
    return null;
  }
};
