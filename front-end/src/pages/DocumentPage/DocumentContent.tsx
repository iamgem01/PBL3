import { useState, useEffect, useRef } from "react";
import { 
  Bold, Italic, Code, List, ListOrdered, Link, Image,
  Heading1, Heading2, Quote, Eye, Edit3, Sparkles, Check, X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface Note {
  id: string;
  title: string;
  content: string;
}

interface DocumentContentProps {
  note: Note | null;
  isUpdating: boolean;
  onUpdateContent: (content: string) => void;
  isCollaborative?: boolean;
  currentUserId?: string;
}

// MarkdownPreview component
const MarkdownPreview = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        p: ({ children }) => (
          <p className="mb-4 leading-7">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mb-2 mt-4 first:mt-0">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-semibold mb-2 mt-3 first:mt-0">
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-base font-semibold mb-1 mt-3 first:mt-0">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-sm font-semibold mb-1 mt-3 first:mt-0">
            {children}
          </h6>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-7">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-4">
            {children}
          </blockquote>
        ),
        code: ({
          inline,
          className,
          children,
          ...props
        }: any) => {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <pre className="bg-muted rounded-lg p-4 mb-4 overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code
              className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg my-4"
          />
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border-collapse border border-border">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/50">{children}</thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-border">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="border border-border px-4 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border px-4 py-2">{children}</td>
        ),
        hr: () => <hr className="my-8 border-border" />,
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        del: ({ children }) => <del className="line-through">{children}</del>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// AI Service functions
const callAIService = async (action: string, text: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/chat/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text,
        ...(action === 'translate' && { targetLanguage: 'tiếng Anh' })
      }),
    });

    if (!response.ok) {
      throw new Error('AI service error');
    }

    const data = await response.json();
    
    // Backend trả về format: { status: 'success', data: { summary/improved/explanation } }
    if (data.status === 'success' && data.data) {
      return data.data.summary || data.data.improved || data.data.explanation || data.data.translated || '';
    }
    
    return '';
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
};

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
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiMenuPosition, setAIMenuPosition] = useState({ x: 0, y: 0 });
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiResult, setAIResult] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [selectedText, setSelectedText] = useState("");
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
      
      setToolbarPosition({
        x: textareaRect.left / 4 + window.scrollX - 20,
        y: textareaRect.top / 2 + window.scrollY - 20,
      });
      setShowFloatingToolbar(true);
      setSelectedText(textarea.value.substring(start, end));
    } else {
      setShowFloatingToolbar(false);
      setShowAIMenu(false);
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

  const handleAIAction = async (action: 'improve' | 'summarize' | 'explain') => {
    if (!selectedText.trim()) return;
    
    setIsAIProcessing(true);
    setOriginalText(selectedText);
    setShowAIMenu(false);
    
    try {
      const result = await callAIService(action, selectedText);
      setAIResult(result);
      
      // Position AI result menu
      setAIMenuPosition({
        x: toolbarPosition.x,
        y: toolbarPosition.y + 60,
      });
    } catch (error) {
      alert('Có lỗi xảy ra khi xử lý văn bản. Vui lòng thử lại.');
      setIsAIProcessing(false);
      setAIResult(null);
    }
  };

  const handleAcceptAIResult = () => {
    if (!aiResult || !textareaRef.current) return;
    
    const { start, end } = selection;
    const newText = `${currentContent.substring(0, start)}${aiResult}${currentContent.substring(end)}`;
    
    setCurrentContent(newText);
    setAIResult(null);
    setIsAIProcessing(false);
    setShowFloatingToolbar(false);
    
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleRejectAIResult = () => {
    setAIResult(null);
    setIsAIProcessing(false);
    setShowFloatingToolbar(true);
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
          {/* Floating Toolbar */}
          {isEditMode && showFloatingToolbar && !aiResult && (
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
              <div className="w-px h-6 bg-border mx-1" />
              <div className="relative">
                <button 
                  onClick={() => setShowAIMenu(!showAIMenu)} 
                  className="p-2 hover:bg-muted rounded transition-colors text-purple-600" 
                  title="AI Assistant"
                  disabled={isAIProcessing}
                >
                  <Sparkles size={16} className={isAIProcessing ? 'animate-pulse' : ''} />
                </button>
                
                {/* AI Menu Dropdown */}
                {showAIMenu && (
                  <div className="absolute top-full mt-2 left-0 bg-card border border-border rounded-lg shadow-xl p-2 min-w-[160px] z-[60]">
                    <button
                      onClick={() => handleAIAction('improve')}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm transition-colors flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      Cải thiện
                    </button>
                    <button
                      onClick={() => handleAIAction('summarize')}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm transition-colors flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      Tóm tắt
                    </button>
                    <button
                      onClick={() => handleAIAction('explain')}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm transition-colors flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      Giải thích
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Result Popup */}
          {aiResult && (
            <div
              className="fixed z-50 bg-card border-2 border-purple-500 rounded-xl shadow-2xl max-w-md"
              style={{
                left: `${aiMenuPosition.x}px`,
                top: `${aiMenuPosition.y}px`,
              }}
            >
              <div className="p-4 border-b border-border bg-purple-50 dark:bg-purple-900/20 rounded-t-xl">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Sparkles size={18} />
                  <span className="font-semibold">Kết quả AI</span>
                </div>
              </div>
              
              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{aiResult}</p>
                </div>
              </div>
              
              <div className="p-3 border-t border-border bg-muted/30 flex gap-2 rounded-b-xl">
                <button
                  onClick={handleAcceptAIResult}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Check size={16} />
                  Chấp nhận
                </button>
                <button
                  onClick={handleRejectAIResult}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <X size={16} />
                  Hủy
                </button>
              </div>
            </div>
          )}

          {isEditMode ? (
            <textarea
              ref={textareaRef}
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              onSelect={handleSelect}
              onBlur={() => setTimeout(() => {
                if (!showAIMenu && !aiResult) {
                  setShowFloatingToolbar(false);
                }
              }, 200)}
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
            <div className="min-h-[400px] prose prose-sm max-w-none">
              <div className="text-foreground">
                {currentContent ? (
                  <MarkdownPreview content={currentContent} />
                ) : (
                  <p className="text-muted-foreground italic">No content yet. Switch to Edit mode to start writing.</p>
                )}
              </div>
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