import { useDocumentState } from "./useDocumentState";
import { DocumentHeader } from "./DocumentHeader";
import { PlainTextContent } from "./DocumentContent";
import Sidebar from "@/components/layout/sidebar/sidebar";
import { DeleteConfirmModal } from "./DocumentModals";
import { DocumentToolbar } from "./DocumentToolbar";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { shareNote, unshareNote } from '@/services/collabService';
import { Users, Loader2 } from "lucide-react";

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
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
          <span className="ml-3 text-muted-foreground">Loading note...</span>
        </div>
      </div>
    </div>
  );

  const ErrorContent = () => (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg p-10 border border-border">
        <div className="text-center text-muted-foreground py-20">
          <p className="text-red-500 dark:text-red-400 mb-4">⚠️ {error}</p>
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
          <p>⚠️ Note not found.</p>
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

  const NoteContent = () => {
    const [isShared, setIsShared] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Kiểm tra trạng thái share của document
    useEffect(() => {
      if (note && note.shares && Array.isArray(note.shares)) {
        const shared = note.shares.length > 0;
        setIsShared(shared);
        console.log(`📊 Document share status: ${shared ? 'SHARED' : 'NOT SHARED'}`);
        console.log(`   Shares count: ${note.shares.length}`);
      } else {
        setIsShared(false);
      }
    }, [note]);

    const handleShareToggle = async () => {
      if (!note?.id) {
        console.error('❌ No note ID available');
        alert('Cannot share: Note ID is missing');
        return;
      }

      console.log('========================================');
      console.log('🔄 STARTING SHARE TOGGLE');
      console.log('========================================');
      console.log('Note ID:', note.id);
      console.log('Current state:', isShared ? 'SHARED' : 'NOT SHARED');
      console.log('Action:', isShared ? 'UNSHARE' : 'SHARE');

      setIsSharing(true);
      setShareStatus('idle');

      try {
        if (isShared) {
          // UNSHARE
          console.log('📤 Calling unshareNote API...');
          await unshareNote(note.id);
          setIsShared(false);
          setShareStatus('success');
          
          console.log('✅ UNSHARE SUCCESSFUL');
          console.log('========================================');
          
          // Show success message
          const confirmed = window.confirm(
            '✅ Document unshared successfully!\n\n' +
            'This document is no longer available for collaboration.\n\n' +
            'Click OK to refresh the page.'
          );
          
          if (confirmed) {
            window.location.reload();
          }
        } else {
          // SHARE
          console.log('📤 Calling shareNote API...');
          console.log('   Sharing with: ["all"]');
          
          await shareNote(note.id, ["all"]);
          setIsShared(true);
          setShareStatus('success');
          
          console.log('✅ SHARE SUCCESSFUL');
          console.log('========================================');
          
          // Show success message
          const confirmed = window.confirm(
            '✅ Document shared successfully!\n\n' +
            'Other users can now collaborate on this note in real-time.\n' +
            'The document will appear in the "Teamspaces" section.\n\n' +
            'Click OK to refresh the page.'
          );
          
          if (confirmed) {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('========================================');
        console.error('❌ SHARE/UNSHARE FAILED');
        console.error('========================================');
        console.error('Error:', error);
        
        setShareStatus('error');
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(
          `❌ Failed to ${isShared ? 'unshare' : 'share'} document\n\n` +
          `Error: ${errorMessage}\n\n` +
          `Please check:\n` +
          `1. Collab-service is running on port 8083\n` +
          `2. Note-service is running on port 8080\n` +
          `3. MongoDB is connected\n` +
          `4. Check browser console for details`
        );
      } finally {
        setIsSharing(false);
        console.log('========================================');
      }
    };

    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg p-10 border border-border">
          {/* Header với Share button */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground">
                {note?.title || "Untitled Document"}
              </h1>
              {isShared && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Shared</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleShareToggle}
              disabled={isSharing}
              title={isShared ? 'Stop sharing this document' : 'Share this document for collaboration'}
              className={`
                px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all
                font-medium text-sm border
                ${isShared 
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800' 
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20'
                }
                ${isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                ${shareStatus === 'success' ? 'ring-2 ring-green-500' : ''}
                ${shareStatus === 'error' ? 'ring-2 ring-red-500' : ''}
              `}
            >
              {isSharing ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>{isShared ? 'Unsharing...' : 'Sharing...'}</span>
                </>
              ) : (
                <>
                  <Users size={14} />
                  <span>{isShared ? 'Shared' : 'Share'}</span>
                </>
              )}
            </button>
          </div>

          {/* Document Header (actions) */}
          <DocumentHeader
            note={note}
            isImportantLoading={isImportantLoading}
            isExporting={isExporting}
            isDeleting={isDeleting}
            onToggleImportant={handleToggleImportant}
            onExportPdf={handleExportPdf}
            onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
          />

          {/* Document Content */}
          {note?.content && (
            <PlainTextContent
              key={note.id}
              note={note}
              isUpdating={isUpdating}
              onUpdateContent={handleUpdateNote}
            />
          )}
          
          {/* Toolbar Portal */}
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

          {/* Delete Confirmation Modal */}
          <DeleteConfirmModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleMoveToTrash}
            isDeleting={isDeleting}
            noteTitle={note?.title}
          />

          {/* Footer */}
          <NoteFooter />
        </div>
      </div>
    );
  };

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