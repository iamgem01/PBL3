import { useDocumentState } from "./useDocumentState";
import { CollaborativeEditor } from "./CollaborativeEditor";
import Sidebar from "@/components/layout/sidebar/sidebar";
import { DeleteConfirmModal } from "./DocumentModals";
import { useCallback, useEffect, useState, useMemo } from "react";
import { shareNote, unshareNote, inviteUser } from '@/services/collabService';
import { 
  Users, Loader2, Mail, X, UserPlus, Check, 
  Star, Download, Trash2, ArrowLeft 
} from "lucide-react";

export default function DocumentPage() {
  const {
    note,
    isLoading,
    error,
    collapsed,
    setCollapsed,
    isDeleting,
    isExporting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isImportantLoading,
    handleUpdateNote,
    handleMoveToTrash,
    handleToggleImportant,
    handleExportPdf,
    getInitialContent, // âœ… Nháº­n function má»›i
    noteId
  } = useDocumentState();

  const [isShared, setIsShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    if (note?.shares && Array.isArray(note.shares)) {
      setIsShared(prev => {
        const newState = (note.shares?.length ?? 0) > 0;
        console.log('ðŸ”„ Sharing status:', { prev, newState, shares: note.shares?.length });
        return prev !== newState ? newState : prev;
      });
    }
  }, [note?.shares]);

  // âœ… FIX: Sá»­ dá»¥ng function thay vÃ¬ memo Ä‘á»ƒ láº¥y initial content
  const initialContent = useMemo(() => {
    return getInitialContent();
  }, [getInitialContent]);

  const handleShareToggle = useCallback(async () => {
    if (!note?.id) return;
    setIsSharing(true);
    try {
      if (isShared) {
        await unshareNote(note.id);
        setIsShared(false);
        alert('âœ… Document unshared successfully!');
      } else {
        await shareNote(note.id, ["all"]);
        setIsShared(true);
        alert('âœ… Document shared successfully!');
      }
    } catch (error: any) {
      alert(`Action failed: ${error.message}`);
    } finally {
      setIsSharing(false);
    }
  }, [note?.id, isShared]);

  const handleInviteUser = useCallback(async () => {
    if (!inviteEmail.trim() || !note?.id) return;
    setIsInviting(true);
    setInviteSuccess(false);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      await inviteUser(note.id, currentUser.email, inviteEmail.trim());
      setInviteSuccess(true);
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteSuccess(false);
      }, 2000);
    } catch (error: any) {
      alert(`Failed: ${error.message}`);
    } finally {
      setIsInviting(false);
    }
  }, [inviteEmail, note?.id]);

  const handleContentChange = useCallback((content: string) => {
    handleUpdateNote(content);
  }, [handleUpdateNote]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`transition-all duration-300 flex-1 flex items-center justify-center ${collapsed ? "ml-20" : "ml-64"}`}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
            <span className="text-muted-foreground">Loading document...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`transition-all duration-300 flex-1 flex items-center justify-center ${collapsed ? "ml-20" : "ml-64"}`}>
          <div className="text-center text-red-500">
            <p className="mb-4">âš ï¸ {error || "Note not found"}</p>
            <button onClick={() => window.history.back()} className="px-4 py-2 bg-muted rounded-lg">Go back</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`transition-all duration-300 flex-1 flex flex-col overflow-hidden ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button onClick={() => window.history.back()} className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-foreground truncate">{note.title}</h1>
              <p className="text-xs text-muted-foreground">Last updated {new Date(note.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isShared ? (
              <button onClick={handleShareToggle} disabled={isSharing} className="flex items-center gap-2 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                {isSharing ? <Loader2 className="animate-spin" size={16} /> : <Users size={16} />}
                <span className="text-sm font-medium">Enable Collaboration</span>
              </button>
            ) : (
              <>
                {note.createdBy === (JSON.parse(localStorage.getItem('user') || '{}').id || 'user_001') && (
                  <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    <Mail size={16} /> <span className="text-sm font-medium">Invite</span>
                  </button>
                )}
                <button onClick={handleShareToggle} disabled={isSharing} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-muted">
                  <X size={16} /> <span className="text-sm">Stop Sharing</span>
                </button>
              </>
            )}

            <div className="w-px h-6 bg-border" />

            <button onClick={handleToggleImportant} disabled={isImportantLoading} className={`p-2 rounded-lg transition-all ${note.isImportant ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-muted'}`}>
              {isImportantLoading ? <Loader2 className="animate-spin" size={18} /> : <Star size={18} fill={note.isImportant ? 'currentColor' : 'none'} />}
            </button>

            <button onClick={handleExportPdf} disabled={isExporting} className="p-2 hover:bg-muted rounded-lg transition-all">
              {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            </button>

            <button onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all">
              {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <CollaborativeEditor
            key={noteId} 
            documentId={noteId || ''}
            isShared={isShared}
            initialContent={initialContent} // âœ… Sá»­ dá»¥ng initial content thÃ´ng minh
            onContentChange={handleContentChange}
          />
        </div>

        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleMoveToTrash}
          isDeleting={isDeleting}
          noteTitle={note.title}
        />

        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><UserPlus size={20} className="text-blue-500"/> Invite Collaborator</h3>
                <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-muted rounded-lg"><X size={20}/></button>
              </div>
              {inviteSuccess ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><Check size={32} className="text-green-600"/></div>
                  <p className="text-green-600 font-medium">Invitation sent successfully!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@example.com" className="w-full px-4 py-2 border border-border rounded-lg bg-background"/>
                  <div className="flex gap-2">
                    <button onClick={handleInviteUser} disabled={isInviting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center gap-2">
                      {isInviting ? 'Sending...' : 'Send Invitation'}
                    </button>
                    <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}