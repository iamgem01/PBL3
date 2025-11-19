import { useDocumentState } from "./useDocumentState";
import { DocumentHeader } from "./DocumentHeader";
import { PlainTextContent } from "./DocumentContent";
import Sidebar from "@/components/layout/sidebar/sidebar";
import { DeleteConfirmModal } from "./DocumentModals";
import { DocumentToolbar } from "./DocumentToolbar";
import { useCallback } from "react";
import { createPortal } from "react-dom";

function formatDate(date?: string | Date | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date instanceof Date ? date : new Date(String(date));
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

  const LoadingContent = () => (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg p-10 border border-border">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading note...</span>
        </div>
      </div>
    </div>
  );

  const ErrorContent = () => (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg p-10 border border-border">
        <div className="text-center text-muted-foreground py-20">
          <p className="text-red-500 dark:text-red-400 mb-4">⚠ {error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  const NotFoundContent = () => (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg p-10 border border-border">
        <div className="text-center text-muted-foreground py-20">
          <p>⚠ Note not found.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  const handleShowToolbar = useCallback((x: number, y: number) => {
    setToolbarPosition({ x, y });
    setShowToolbar(x !== 0 && y !== 0);
  }, [setShowToolbar, setToolbarPosition]);

  const NoteFooter = () => (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-card/50 rounded-xl p-4 border border-border">
        <div className="text-sm text-muted-foreground text-center">
          Created: {note ? formatDate(note.createdAt) : ""}
        </div>
      </div>
    </div>
  );

  const NoteContent = () => (
    <div className="min-h-screen bg-background p-8">
      <DocumentHeader
        note={note}
        isImportantLoading={isImportantLoading}
        isExporting={isExporting}
        isDeleting={isDeleting}
        onToggleImportant={handleToggleImportant}
        onExportPdf={handleExportPdf}
        onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
      />

      {note?.content && (
        <PlainTextContent
          key={note.id}
          note={note}
          isUpdating={isUpdating}
          onUpdateContent={handleUpdateNote}
        />
      )}
      
      {createPortal(
        <DocumentToolbar
          showToolbar={showToolbar}
          toolbarPosition={toolbarPosition}
          onHideToolbar={() => {
            setShowToolbar(false);
            setToolbarPosition({ x: 0, y: 0 });
          }}
        />,
        document.getElementById("portal") ?? document.body
      )}

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
    <div className="flex h-screen bg-background">
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