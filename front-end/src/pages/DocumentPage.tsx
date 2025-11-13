import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { 
  getNoteById, 
  updateNote, 
  markAsImportant, 
  removeAsImportant, 
  moveToTrash,
  exportNoteAsPdf
} from "@/services/noteService";
import Sidebar from "@/components/layout/sidebar/sidebar";
import { Tool } from "@/components/Toolbar/Tool"; 

// ===== HÀM HELPER FORMAT DATE =====
const formatDate = (dateString: string): string => {
  if (!dateString || dateString === null || dateString === undefined || dateString === '') {
    return new Date().toLocaleString();
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isImportant?: boolean;
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  
  // State toolbar
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // State cho các chức năng mới
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isImportantLoading, setIsImportantLoading] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) {
        setError("Note ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const noteData = await getNoteById(id);
        setNote(noteData);
      } catch (err: any) {
        setError(err.message || "Failed to load note");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  // Xử lý selection và toolbar
  useEffect(() => {
    let savedRange: Range | null = null;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      
      // Kiểm tra selection tồn tại và có rangeCount
      if (!selection || selection.rangeCount === 0) return;
      
      const selectedText = selection.toString();
      
      if (selectedText.length > 0) {
        // Lưu range hiện tại trước khi làm bất cứ điều gì
        savedRange = selection.getRangeAt(0).cloneRange();

        const range = selection.getRangeAt(0);
        if (range && contentRef.current?.contains(range.commonAncestorContainer)) {
          const rect = range.getBoundingClientRect();
          
          setToolbarPosition({
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY - 60
          });
          
          // HIỂN THỊ TOOLBAR NGAY LẬP TỨC
          setShowToolbar(true);
          
          // KHÔI PHỤC SELECTION NGAY SAU KHI TOOLBAR XUẤT HIỆN
          setTimeout(() => {
            if (savedRange) {
              const newSelection = window.getSelection();
              if (newSelection) {
                newSelection.removeAllRanges();
                newSelection.addRange(savedRange.cloneRange());
              }
            }
          }, 0);
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolbarRef.current && 
        !toolbarRef.current.contains(e.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        setShowToolbar(false);
      }
    };

    // Thêm event listener
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ===== HANDLER FUNCTIONS =====

  /**
   * Cập nhật nội dung ghi chú
   */
  const handleUpdateNote = async (newContent: string) => {
    if (!note || !id) return;

    setIsUpdating(true);
    try {
      const updatedNote = await updateNote(id, {
        ...note,
        content: newContent,
        updatedAt: new Date().toISOString()
      });
      setNote(updatedNote);
    } catch (error: any) {
      setError("Failed to update note: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveToTrash = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await moveToTrash(id, 'NOTE');
      navigate(-1); // Quay lại trang trước
    } catch (error: any) {
      setError("Failed to move note to trash: " + error.message);
      setIsDeleting(false);
    }
  };

  /**
   * Toggle trạng thái quan trọng
   */
  const handleToggleImportant = async () => {
    if (!note || !id) return;

    setIsImportantLoading(true);
    try {
      let updatedNote;
      if (note.isImportant) {
        updatedNote = await removeAsImportant(id);
      } else {
        updatedNote = await markAsImportant(id);
      }
      setNote(updatedNote);
    } catch (error: any) {
      setError("Failed to update important status: " + error.message);
    } finally {
      setIsImportantLoading(false);
    }
  };

  /**
   * Export ghi chú dưới dạng PDF
   */
  const handleExportPdf = async () => {
    if (!id) return;

    setIsExporting(true);
    try {
      const blob = await exportNoteAsPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note?.title || 'note'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError("Failed to export note: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const LoadingContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-4xl mx-auto bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-10 border border-gray-100">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading note...</span>
        </div>
      </div>
    </div>
  );

  const ErrorContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-4xl mx-auto bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-10 border border-gray-100">
        <div className="text-center text-gray-500 py-20">
          <p className="text-red-500 mb-4">❌ {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  const NotFoundContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-4xl mx-auto bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-10 border border-gray-100">
        <div className="text-center text-gray-500 py-20">
          <p>❌ Note not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  const NoteStructuredContent = ({ content }: { content: string }) => {
    try {
      const parsedContent = JSON.parse(content);
      return <StructuredNoteRenderer content={parsedContent} />;
    } catch {
      return <PlainTextContent content={content} />;
    }
  };

  const StructuredNoteRenderer = ({ content }: { content: any }) => {
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-gabarito bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {content.title || note?.title || "Travel Planner"}
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

  // ===== COMPONENT NỘI DUNG VĂN BẢN =====
  const PlainTextContent = ({ content }: { content: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);

    const handleSave = () => {
      handleUpdateNote(editContent);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditContent(content);
      setIsEditing(false);
    };

    return (
      <div className="max-w-4xl mx-auto backdrop-blur-sm">
        <div className="bg-white/70 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Note Content</h3>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="p-8">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your note content..."
              />
            ) : (
              <div 
                ref={contentRef}
                className="cursor-text whitespace-pre-wrap text-gray-800 leading-relaxed text-lg select-text"
                style={{ 
                  userSelect: "text", 
                  WebkitUserSelect: "text", 
                  MozUserSelect: "text",
                  msUserSelect: "text",
                  position: "relative", 
                  zIndex: 0 
                }}
              >
                {content
                  ? content.split("\n").map((line, index) => (
                      <p key={index} className="my-1 select-text">
                        {line}
                      </p>
                    ))
                  : "No content available"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const NoteContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      {/* Document Header */}
      <div 
        className="max-w-4xl mx-auto mb-8 bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-6 border border-gray-100 select-none"
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to notes"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-gabarito">
                {note?.title || "Untitled Note"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Last updated {note ? formatDate(note.updatedAt) : ''}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Toggle Important */}
            <button
              onClick={handleToggleImportant}
              disabled={isImportantLoading}
              className={`p-2 rounded-lg transition-colors ${
                note?.isImportant 
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={note?.isImportant ? "Remove from important" : "Mark as important"}
            >
              {isImportantLoading ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <span className="text-lg">⭐</span>
              )}
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPdf}
              disabled={true}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Export as PDF"
            >
              {isExporting ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
              title="Delete note"
            >
              {isDeleting ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      {note?.content && <NoteStructuredContent content={note.content} />}

      {/* Document Footer */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500 text-center">
            Created: {note ? formatDate(note.createdAt) : ''}
          </div>
        </div>
      </div>

      {/* Floating Toolbar - Selection Toolbar */}
      {showToolbar && (
        <div
          ref={toolbarRef}
          className="fixed z-50 transition-all duration-200 ease-out"
          style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
          }}
          onMouseDown={(e) => {
            // Ngăn mất selection khi click vào toolbar
            e.preventDefault();
            // Khôi phục selection khi click toolbar
            const selection = window.getSelection();
            if (selection && contentRef.current) {
              selection.removeAllRanges();
              // Tạo range mới từ vị trí đã lưu
              const range = document.createRange();
              range.selectNodeContents(contentRef.current);
              selection.addRange(range);
            }
          }}
        >
          <div className="shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <Tool />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Note</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{note?.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveToTrash}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Moving...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (isLoading) return <LoadingContent />;
    if (error) return <ErrorContent />;
    if (!note) return <NotFoundContent />;
    return <NoteContent />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`transition-all duration-300 flex-1 overflow-y-auto ${collapsed ? "ml-20" : "ml-64"}`}>
        {renderContent()}
      </main>
    </div>
  );
}