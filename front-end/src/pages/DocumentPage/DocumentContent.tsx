import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Note } from "./documentTypes";
import "highlight.js/styles/github-dark.css";
import { 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered, 
  Link, 
  Image,
  Heading1,
  Heading2,
  Quote,
  Eye,
  Edit3
} from "lucide-react";

interface DocumentContentProps {
  note: Note | null;
  isUpdating: boolean;
  onUpdateContent: (content: string) => void;
  onShowToolbar?: (position: { x: number; y: number }) => void;
}

export const PlainTextContent = ({
  note,
  isUpdating,
  onUpdateContent,
}: DocumentContentProps) => {
  const [currentContent, setCurrentContent] = useState(note?.content || "");
  const [isEditMode, setIsEditMode] = useState(true);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
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

  // Handle text selection
  const handleSelect = () => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    setSelection({ start, end });

    // Show floating toolbar if text is selected
    if (start !== end) {
      const textarea = textareaRef.current;
      const textareaRect = textarea.getBoundingClientRect();
      
      // Calculate approximate position based on selection
      const textBeforeSelection = textarea.value.substring(0, start);
      const lines = textBeforeSelection.split('\n');
      const lineNumber = lines.length - 1;
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
      
      // Calculate Y position based on line number and scroll position
      const yOffset = (lineNumber * lineHeight) - textarea.scrollTop;
      
      // Position toolbar above the selection
      setToolbarPosition({
        x: textareaRect.left / 4 + window.scrollX -20,
        y: textareaRect.top / 2 + window.scrollY - 20,
      });
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  };

  // Insert markdown syntax
  const insertMarkdown = (before: string, after: string = before) => {
    if (!textareaRef.current) return;

    const { start, end } = selection;
    const selectedText = currentContent.substring(start, end);
    const newText = `${currentContent.substring(0, start)}${before}${selectedText}${after}${currentContent.substring(end)}`;
    
    setCurrentContent(newText);
    setShowFloatingToolbar(false);
    
    // Restore focus and selection
    setTimeout(() => {
      textareaRef.current?.focus();
      const newStart = start + before.length;
      const newEnd = newStart + selectedText.length;
      textareaRef.current?.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  // Format actions
  const formatBold = () => insertMarkdown("**");
  const formatItalic = () => insertMarkdown("*");
  const formatCode = () => insertMarkdown("`");
  const formatLink = () => insertMarkdown("[", "](url)");
  const formatImage = () => insertMarkdown("![", "](url)");
  const formatH1 = () => insertMarkdown("# ", "");
  const formatH2 = () => insertMarkdown("## ", "");
  const formatList = () => insertMarkdown("- ", "");
  const formatOrderedList = () => insertMarkdown("1. ", "");
  const formatQuote = () => insertMarkdown("> ", "");

  return (
    <div className="max-w-4xl mx-auto backdrop-blur-sm">
      <div className="bg-white/70 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-700">Note Content</h3>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsEditMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded transition-colors ${
                  isEditMode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Edit3 size={14} />
                Edit
              </button>
              <button
                onClick={() => setIsEditMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded transition-colors ${
                  !isEditMode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>

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

        {/* Markdown Toolbar - Only show in edit mode */}
        {isEditMode && (
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={formatBold}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={formatItalic}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={formatCode}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Inline Code"
              >
                <Code size={16} />
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <button
                onClick={formatH1}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Heading 1"
              >
                <Heading1 size={16} />
              </button>
              <button
                onClick={formatH2}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Heading 2"
              >
                <Heading2 size={16} />
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <button
                onClick={formatList}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Bullet List"
              >
                <List size={16} />
              </button>
              <button
                onClick={formatOrderedList}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Numbered List"
              >
                <ListOrdered size={16} />
              </button>
              <button
                onClick={formatQuote}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Quote"
              >
                <Quote size={16} />
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <button
                onClick={formatLink}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Insert Link"
              >
                <Link size={16} />
              </button>
              <button
                onClick={formatImage}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Insert Image"
              >
                <Image size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="p-8 relative">
          {/* Floating Toolbar for Selection */}
          {isEditMode && showFloatingToolbar && (
            <div
              className="fixed z-50 bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-200 p-2 flex items-center gap-1"
              style={{
              left: `${toolbarPosition.x}px`,
              top: `${toolbarPosition.y}px`,
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
            >
              <button
              onClick={formatBold}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Bold"
              >
              <Bold size={16} />
              </button>
              <button
              onClick={formatItalic}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Italic"
              >
              <Italic size={16} />
              </button>
              <button
              onClick={formatCode}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Code"
              >
              <Code size={16} />
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <button
              onClick={formatLink}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Link"
              >
              <Link size={16} />
              </button>
              <button
              onClick={formatQuote}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Quote"
              >
              <Quote size={16} />
              </button>
            </div>
          )}

          {isEditMode ? (
            <textarea
              ref={textareaRef}
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              onSelect={handleSelect}
              onBlur={() => setTimeout(() => setShowFloatingToolbar(false), 200)}
              placeholder="Start writing your note in Markdown..."
              className="w-full min-h-[400px] text-gray-700 placeholder-gray-400 border-none outline-none focus:ring-0 p-0 resize-none font-mono text-sm leading-6"
              style={{
                lineHeight: "1.5",
                tabSize: 4,
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
              spellCheck={false}
            />
          ) : (
          <div className="min-h-[400px] prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => (
                  <p className="mb-4 leading-7 text-gray-700">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-4 mt-6 text-gray-900 border-b pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold mb-3 mt-5 text-gray-900">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mb-2 mt-4 text-gray-900">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold mb-2 mt-3 text-gray-900">
                    {children}
                  </h4>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-7 text-gray-700">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <pre className="mb-4 rounded-lg bg-gray-900 text-white p-4 overflow-x-auto">
                      <code className={`hljs language-${match[1]}`} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code
                      className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono text-red-600"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-300 border">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {children}
                  </td>
                ),
                hr: () => <hr className="my-8 border-gray-300" />,
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto rounded-lg shadow-md my-4"
                  />
                ),
              }}
            >
              {currentContent || "*No content yet. Switch to Edit mode to start writing.*"}
            </ReactMarkdown>
          </div>
          )}

          {/* Footer info */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <div>
              Lines: {currentContent.split("\n").length} | Characters:{" "}
              {currentContent.length} | Words:{" "}
              {currentContent.trim()
                ? currentContent.trim().split(/\s+/).length
                : 0}
            </div>
            <div className="flex items-center gap-2">
              <span>Markdown</span>
              <span>•</span>
              <span>Auto-saved</span>
            </div>
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
