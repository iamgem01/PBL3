import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Note } from "./documentTypes";
import "highlight.js/styles/github-dark.css";
import { 
  Bold, Italic, Code, List, ListOrdered, Link, Image,
  Heading1, Heading2, Quote, Eye, Edit3
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

  useEffect(() => {
    setCurrentContent(note?.content || "");
  }, [note?.content]);

  useEffect(() => {
    if (currentContent !== (note?.content || "")) {
      const timeoutId = setTimeout(() => {
        onUpdateContent(currentContent);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentContent, note?.content, onUpdateContent]);

  const handleSelect = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    setSelection({ start, end });

    if (start !== end) {
      const textarea = textareaRef.current;
      const textareaRect = textarea.getBoundingClientRect();
      const textBeforeSelection = textarea.value.substring(0, start);
      const lines = textBeforeSelection.split('\n');
      const lineNumber = lines.length - 1;
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
      const yOffset = (lineNumber * lineHeight) - textarea.scrollTop;
      
      setToolbarPosition({
        x: textareaRect.left / 4 + window.scrollX -20,
        y: textareaRect.top / 2 + window.scrollY - 20,
      });
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  };

  const insertMarkdown = (before: string, after: string = before) => {
    if (!textareaRef.current) return;
    const { start, end } = selection;
    const selectedText = currentContent.substring(start, end);
    const newText = `${currentContent.substring(0, start)}${before}${selectedText}${after}${currentContent.substring(end)}`;
    
    setCurrentContent(newText);
    setShowFloatingToolbar(false);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      const newStart = start + before.length;
      const newEnd = newStart + selectedText.length;
      textareaRef.current?.setSelectionRange(newStart, newEnd);
    }, 0);
  };

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
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-foreground">Note Content</h3>
            
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setIsEditMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded transition-colors ${
                  isEditMode
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 size={14} />
                Edit
              </button>
              <button
                onClick={() => setIsEditMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded transition-colors ${
                  !isEditMode
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUpdating && (
              <div className="flex items-center gap-2 text-primary text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>

        {isEditMode && (
          <div className="px-4 py-2 border-b border-border bg-muted/50">
            <div className="flex items-center gap-1 flex-wrap">
              <button onClick={formatBold} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="Bold">
                <Bold size={16} />
              </button>
              <button onClick={formatItalic} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="Italic">
                <Italic size={16} />
              </button>
              <button onClick={formatCode} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="Code">
                <Code size={16} />
              </button>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <button onClick={formatH1} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="Heading 1">
                <Heading1 size={16} />
              </button>
              <button onClick={formatH2} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="Heading 2">
                <Heading2 size={16} />
              </button>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <button onClick={formatList} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="List">
                <List size={16} />
              </button>
              <button onClick={formatOrderedList} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="Ordered List">
                <ListOrdered size={16} />
              </button>
              <button onClick={formatQuote} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="Quote">
                <Quote size={16} />
              </button>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <button onClick={formatLink} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="Link">
                <Link size={16} />
              </button>
              <button onClick={formatImage} className="p-2 hover:bg-muted rounded transition-colors text-foreground" title="Image">
                <Image size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="p-8 relative">
          {isEditMode && showFloatingToolbar && (
            <div
              className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl p-2 flex items-center gap-1"
              style={{
                left: `${toolbarPosition.x}px`,
                top: `${toolbarPosition.y}px`,
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <button onClick={formatBold} className="p-2 hover:bg-muted rounded transition-colors" title="Bold">
                <Bold size={16} />
              </button>
              <button onClick={formatItalic} className="p-2 hover:bg-muted rounded transition-colors" title="Italic">
                <Italic size={16} />
              </button>
              <button onClick={formatCode} className="p-2 hover:bg-muted rounded transition-colors" title="Code">
                <Code size={16} />
              </button>
              <div className="w-px h-6 bg-border mx-1" />
              <button onClick={formatLink} className="p-2 hover:bg-muted rounded transition-colors" title="Link">
                <Link size={16} />
              </button>
              <button onClick={formatQuote} className="p-2 hover:bg-muted rounded transition-colors" title="Quote">
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
              className="w-full min-h-[400px] bg-transparent text-foreground placeholder-muted-foreground border-none outline-none focus:ring-0 p-0 resize-none font-mono text-sm leading-6"
              style={{
                lineHeight: "1.5",
                tabSize: 4,
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
              spellCheck={false}
            />
          ) : (
            <div className="min-h-[400px] prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  p: ({ children }) => <p className="mb-4 leading-7 text-foreground">{children}</p>,
                  h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6 text-foreground border-b border-border pb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-5 text-foreground">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-4 text-foreground">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="leading-7 text-foreground">{children}</li>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted text-foreground italic">{children}</blockquote>,
                  code: ({ inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <pre className="mb-4 rounded-lg bg-muted p-4 overflow-x-auto">
                        <code className={`hljs language-${match[1]}`} {...props}>{children}</code>
                      </pre>
                    ) : (
                      <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono text-primary" {...props}>{children}</code>
                    );
                  },
                  a: ({ children, href }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                }}
              >
                {currentContent || "*No content yet. Switch to Edit mode to start writing.*"}
              </ReactMarkdown>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <div>
              Lines: {currentContent.split("\n").length} | Characters: {currentContent.length} | Words: {currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0}
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
        <p className="text-muted-foreground">{content.subtitle || "Packing list"}</p>
      </div>

      <div className="space-y-6">
        {content.sections?.map((section: any, index: number) => (
          <div key={index} className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <h3 className="text-xl font-bold mb-4 text-foreground">{section.title}</h3>
            <div className="space-y-2">
              {section.items?.map((item: any, itemIndex: number) => (
                <div key={itemIndex} className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{item.text}</span>
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
    return null;
  }
};