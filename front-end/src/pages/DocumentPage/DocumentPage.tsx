import { useDocumentState } from "./useDocumentState";
import { DocumentHeader } from "./DocumentHeader";
import { PlainTextContent } from "./DocumentContent";
import Sidebar from "@/components/layout/sidebar/sidebar";
import { DeleteConfirmModal } from "./DocumentModals";
import { DocumentToolbar } from "./DocumentToolbar";
import { useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { shareNote, unshareNote, inviteUser } from '@/services/collabService';
import { Users, Loader2, Mail, X, UserPlus, Check } from "lucide-react";
import { collabSocketService } from '@/services/collabSocketService';
import { PresenceIndicator } from '@/components/PresenceIndicator';
import { SelectionHighlighter } from '@/components/SelectionHighlighter';
import { usePresence } from '@/hooks/usePresence';

interface SelectionRange {
  userId: string;
  userName: string;
  start: number;
  end: number;
  color: string;
}

function formatDate(date?: string | Date | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date instanceof Date ? date : new Date(String(date));
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleString();
}

interface ActiveUser {
  userId: string;
  email: string;
  name: string;
  color: string;
  cursorPosition?: number;
}

export default function DocumentPage() {
  const [selections, setSelections] = useState<SelectionRange[]>([]);
  
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
    noteId
  } = useDocumentState();

  const { users, typingUsers } = usePresence(noteId || '');

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
    
    // Invite Modal State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);
    
    // Active Users (Real-time collaboration)
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const currentUser = useRef({
      userId: 'user_' + Math.random().toString(36).substr(2, 9),
      email: 'current@user.com',
      name: 'Current User'
    });

    const generateColor = (userId: string): string => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
      const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      return colors[index];
    };

    // Kiểm tra trạng thái share của document
    useEffect(() => {
      if (note && note.shares && Array.isArray(note.shares)) {
        const shared = note.shares.length > 0;
        setIsShared(shared);
      } else {
        setIsShared(false);
      }
    }, [note]);

    // Real-time collaboration - WebSocket
    useEffect(() => {
      if (!noteId || !isShared) return;

      collabSocketService.connect(
        noteId,
        // onMessage callback
        (message) => {
          if (message.senderId === currentUser.current.userId) {
            return;
          }
          
          if (message.type === 'EDIT' && message.senderId !== currentUser.current.userId) {
            handleUpdateNote(message.content);
          }
        },
        // onUserJoin callback
        (userJoin) => {
          setActiveUsers(prev => {
            const existing = prev.find(u => u.userId === userJoin.userId);
            if (!existing) {
              return [...prev, {
                userId: userJoin.userId,
                email: userJoin.email,
                name: userJoin.name,
                color: generateColor(userJoin.userId)
              }];
            }
            return prev;
          });
        },
        // onUserLeave callback  
        (userLeave) => {
          setActiveUsers(prev => prev.filter(u => u.userId !== userLeave.userId));
          setSelections(prev => prev.filter(s => s.userId !== userLeave.userId));
        },
        // onCursorUpdate callback
        (cursorUpdate) => {
          setActiveUsers(prev => 
            prev.map(u => 
              u.userId === cursorUpdate.userId 
                ? { ...u, cursorPosition: cursorUpdate.position }
                : u
            )
          );
        },
        // onPresenceUpdate callback
        undefined,
        // onTypingUpdate callback
        undefined,
        // onSelectionUpdate callback
        (selectionUpdate) => {
          setSelections(prev => 
            prev.filter(s => s.userId !== selectionUpdate.userId)
                .concat({
                  userId: selectionUpdate.userId,
                  userName: selectionUpdate.name || 'Anonymous',
                  start: selectionUpdate.selection.start,
                  end: selectionUpdate.selection.end,
                  color: selectionUpdate.color || generateColor(selectionUpdate.userId)
                })
          );
        },
        // onConnected callback
        () => {
          collabSocketService.sendUserJoin(
            noteId,
            currentUser.current.userId,
            currentUser.current.email,
            currentUser.current.name
          );
        }
      );
      
      return () => {
        if (collabSocketService.isConnected()) {
          collabSocketService.sendUserLeave(
            noteId,
            currentUser.current.userId
          );
        }
        collabSocketService.disconnect();
      };
    }, [noteId, isShared, handleUpdateNote]);

    const handleSelectionChange = (start: number, end: number) => {
      if (!noteId || !isShared) return;
      collabSocketService.sendSelectionUpdate(noteId, { start, end });
    };
    
    const handleTextChange = (newContent: string) => {
      if (!noteId || !isShared) return;
      collabSocketService.startTyping(noteId);
      handleUpdateNote(newContent);
    };

    const handleShareToggle = async () => {
      if (!note?.id) {
        alert('Cannot share: Note ID is missing');
        return;
      }

      setIsSharing(true);
      setShareStatus('idle');

      try {
        if (isShared) {
          await unshareNote(note.id);
          setIsShared(false);
          setShareStatus('success');
          
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
          setShareStatus('success');
          
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
        setShareStatus('error');
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
        await inviteUser(
          note.id,
          currentUser.current.email,
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

    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg p-10 border border-border">
          {/* Presence Indicator */}
          {isShared && (
            <div className="mb-6">
              <PresenceIndicator users={users} />
            </div>
          )}

          {/* Header với Share/Invite buttons */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground">
                {note?.title || "Untitled Document"}
              </h1>
              {isShared && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Collaborative</span>
                  </div>
                  {activeUsers.length > 0 && (
                    <div className="flex items-center gap-1">
                      {activeUsers.slice(0, 3).map((user) => (
                        <div
                          key={user.userId}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ backgroundColor: user.color }}
                          title={user.email}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {activeUsers.length > 3 && (
                        <span className="text-xs text-gray-500">+{activeUsers.length - 3}</span>
                      )}
                    </div>
                  )}
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
                    px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all
                    font-medium text-sm border
                    border-blue-600 text-blue-600 hover:bg-blue-50 
                    dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20
                    ${isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                  `}
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                      <span>Enabling...</span>
                    </>
                  ) : (
                    <>
                      <Users size={14} />
                      <span>Enable Collaboration</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all
                      font-medium text-sm border border-green-600 text-green-600 
                      hover:bg-green-50 dark:border-green-500 dark:text-green-400 
                      dark:hover:bg-green-900/20 hover:shadow-sm"
                  >
                    <Mail size={14} />
                    <span>Invite Users</span>
                  </button>

                  <button
                    onClick={handleShareToggle}
                    disabled={isSharing}
                    title="Stop sharing this document"
                    className="px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all
                      font-medium text-sm border border-gray-300 text-gray-700 
                      hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 
                      dark:hover:bg-gray-800 hover:shadow-sm"
                  >
                    <X size={14} />
                    <span>Stop Sharing</span>
                  </button>
                </>
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

          {/* Document Content với Selection Highlighter */}
          {note?.content && (
            <div className="relative">
              <PlainTextContent
                key={note.id}
                note={note}
                isUpdating={isUpdating}
                onUpdateContent={handleTextChange}
                isCollaborative={isShared}
                currentUserId={currentUser.current.userId}
                onSelectionChange={handleSelectionChange}
              />
              
              {/* Selection Highlighter cho collaborative selection */}
              {isShared && (
                <SelectionHighlighter 
                  selections={selections} 
                  content={note?.content || ''} 
                />
              )}
            </div>
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

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
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
                    className="text-gray-500 hover:text-gray-700"
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
                        <label className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@example.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                            rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                            dark:bg-gray-700 dark:text-white"
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
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md
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
                            rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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