import { useDocumentState } from "./useDocumentState";
import { DocumentHeader } from "./DocumentHeader";
import { CollaborativeEditor } from "./CollaborativeEditor";
import Sidebar from "@/components/layout/sidebar/sidebar";
import { DeleteConfirmModal } from "./DocumentModals";
import { useCallback, useEffect, useState } from "react";
import { shareNote, unshareNote, inviteUser } from '@/services/collabService';
import { Users, Loader2, Mail, X, UserPlus, Check, Calendar, Clock } from "lucide-react";

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
    noteId
  } = useDocumentState();

  const [isShared, setIsShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Kiểm tra trạng thái share của document
  useEffect(() => {
    if (note && note.shares && Array.isArray(note.shares)) {
      const shared = note.shares.length > 0;
      setIsShared(shared);
    } else {
      setIsShared(false);
    }
  }, [note]);

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

  const handleShareToggle = async () => {
    if (!note?.id) {
      alert('Cannot share: Note ID is missing');
      return;
    }

    setIsSharing(true);

    try {
      if (isShared) {
        await unshareNote(note.id);
        setIsShared(false);
        
        const confirmed = window.confirm(
          '✅ Document unshared successfully!\n\n' +
          'This document is no longer available for collaboration.\n\n' +
          'Click OK to refresh the page.'
        );
        
        if (confirmed) {
          window.location.reload();
        }
      } else {
        await shareNote(note.id, ["all"]);
        setIsShared(true);
        
        const confirmed = window.confirm(
          '✅ Document shared successfully!\n\n' +
          'This document is now ready for collaboration.\n' +
          'Use "Invite Users" to add collaborators via email.\n\n' +
          'Click OK to refresh the page.'
        );
        
        if (confirmed) {
          window.location.reload();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Failed to ${isShared ? 'unshare' : 'share'} document\n\nError: ${errorMessage}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    if (!note?.id) {
      alert('Cannot invite: Note ID is missing');
      return;
    }

    setIsInviting(true);
    setInviteSuccess(false);

    try {
      // Get current user from localStorage or auth context
      const currentUser = JSON.parse(localStorage.getItem('user') || '{"email": "current@user.com"}');
      
      await inviteUser(
        note.id,
        currentUser.email,
        inviteEmail.trim()
      );

      setInviteSuccess(true);
      
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteSuccess(false);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to send invitation: ${errorMessage}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleContentChange = useCallback((content: string) => {
    handleUpdateNote(content);
  }, [handleUpdateNote]);

  const NoteFooter = () => (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="bg-card/50 rounded-xl p-6 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Created: {note ? formatDate(note.createdAt) : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Updated: {note ? formatDate(note.updatedAt) : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>
              {isShared ? "Collaborative Mode" : "Private Document"}
            </span>
          </div>
        </div>
        
        {note?.tags && note.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const NoteContent = () => {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto bg-card rounded-2xl shadow-lg border border-border my-8">
          {/* Header với Share/Invite buttons */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground">
                {note?.title || "Untitled Document"}
              </h1>
              {isShared && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Collaborative Mode - Real-time Editing</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isShared ? (
                <button
                  onClick={handleShareToggle}
                  disabled={isSharing}
                  title="Enable collaboration on this document"
                  className={`
                    px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                    font-medium text-sm border-2
                    border-blue-600 text-blue-600 hover:bg-blue-50 
                    dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20
                    ${isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm hover:-translate-y-0.5'}
                  `}
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>Enabling...</span>
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      <span>Enable Collaboration</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                      font-medium text-sm border-2 border-green-600 text-green-600 
                      hover:bg-green-50 dark:border-green-500 dark:text-green-400 
                      dark:hover:bg-green-900/20 hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <Mail size={16} />
                    <span>Invite Users</span>
                  </button>

                  <button
                    onClick={handleShareToggle}
                    disabled={isSharing}
                    title="Stop sharing this document"
                    className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                      font-medium text-sm border-2 border-gray-300 text-gray-700 
                      hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 
                      dark:hover:bg-gray-800 hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <X size={16} />
                    <span>Stop Sharing</span>
                  </button>
                </div>
              )}
            </div>
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

          {/* Collaborative Editor */}
          <div className="border-t border-border">
            <CollaborativeEditor
              documentId={noteId || ''}
              isShared={isShared}
              initialContent={note?.content}
              onContentChange={handleContentChange}
            />
          </div>

          {/* Delete Confirmation Modal */}
          <DeleteConfirmModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleMoveToTrash}
            isDeleting={isDeleting}
            noteTitle={note?.title}
          />

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <UserPlus size={20} className="text-blue-500" />
                    Invite Collaborator
                  </h3>
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                      setInviteSuccess(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {inviteSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <p className="text-center text-green-600 font-medium">
                      Invitation sent successfully!
                    </p>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {inviteEmail} will receive an email invitation
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Enter the email address of the person you want to invite to collaborate on this document.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@example.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                            rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            dark:bg-gray-700 dark:text-white transition-colors"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleInviteUser();
                            }
                          }}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleInviteUser}
                          disabled={isInviting || !inviteEmail.trim()}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg
                            hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center gap-2 transition-colors"
                        >
                          {isInviting ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Mail size={16} />
                              <span>Send Invitation</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowInviteModal(false);
                            setInviteEmail('');
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                            rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <NoteFooter />
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