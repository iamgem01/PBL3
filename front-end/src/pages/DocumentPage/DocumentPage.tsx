import { useDocumentState } from "./useDocumentState";
import { DocumentHeader } from "./DocumentHeader";
import { PlainTextContent, NoteStructuredContent } from "./DocumentContent";
import Sidebar from "@/components/layout/sidebar/sidebar";
import { DeleteConfirmModal } from "./DocumentModals";
import { DocumentToolbar } from "./DocumentToolbar";
import { useEffect } from "react";

function formatDate(date?: string | Date | null) {
  if (!date) return "";
  const d =
    typeof date === "string"
      ? new Date(date)
      : date instanceof Date
      ? date
      : new Date(String(date));
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleString();
}

export default function DocumentPage() {
  const {
    note,
    isLoading,
    error,
    collapsed,
    setCollapsed,
    showToolbar,
    setShowToolbar,
    toolbarPosition,
    setToolbarPosition,
    isUpdating,
    isDeleting,
    isExporting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isImportantLoading,
    handleUpdateNote,
    handleMoveToTrash,
    handleToggleImportant,
    handleExportPdf,
  } = useDocumentState();
  // Loading state
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

  // Error state
  const ErrorContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-4xl mx-auto bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-10 border border-gray-100">
        <div className="text-center text-gray-500 py-20">
          <p className="text-red-500 mb-4">❌ {error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  // Not found state
  const NotFoundContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-4xl mx-auto bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-10 border border-gray-100">
        <div className="text-center text-gray-500 py-20">
          <p>❌ Note not found.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  // Footer
  const NoteFooter = () => (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          Created: {note ? formatDate(note.createdAt) : ""}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    console.log({ showToolbar });
  }, [showToolbar]);

  const NoteContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      {/* Document Header */}
      <DocumentHeader
        note={note}
        isImportantLoading={isImportantLoading}
        isExporting={isExporting}
        isDeleting={isDeleting}
        onToggleImportant={handleToggleImportant}
        onExportPdf={handleExportPdf}
        onShowDeleteConfirm={() => {
          setShowDeleteConfirm(true);
        }}
      />

      {/* Document Content */}
      {note?.content && (
        <PlainTextContent
          note={note}
          isUpdating={isUpdating}
          onUpdateContent={handleUpdateNote}
          onShowToolbar={(position) => {
            setToolbarPosition(position);
            setShowToolbar(position.x !== 0 && position.y !== 0);
          }}
        />
      )}

      <DocumentToolbar
        showToolbar={showToolbar}
        toolbarPosition={toolbarPosition}
        onHideToolbar={() => {
          setShowToolbar(false);
          setToolbarPosition({ x: 0, y: 0 });
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleMoveToTrash}
        isDeleting={isDeleting}
        noteTitle={note?.title}
      />
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
      <main
        className={`transition-all duration-300 flex-1 overflow-y-auto ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {renderContent()}
      </main>
    </div>
  );
}
