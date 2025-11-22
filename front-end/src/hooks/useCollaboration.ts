import { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { collabSocketService } from '@/services/collabSocketService';
import type {
  CursorUpdateMessage,
  SelectionMessage,
} from '@/services/collabSocketService';

interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: { pos: number };
  selection?: { from: number; to: number };
}

interface UseCollaborationProps {
  noteId: string;
  isShared: boolean;
  editor: Editor | null;
}

export const useCollaboration = ({ noteId, isShared, editor }: UseCollaborationProps) => {
  const [cursorUsers, setCursorUsers] = useState<CollaborativeUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const lastCursorPos = useRef<number | null>(null);
  const lastSelection = useRef<{ from: number; to: number } | null>(null);
  const cursorUpdateTimeoutRef = useRef<number | null>(null);
  const selectionUpdateTimeoutRef = useRef<number | null>(null);
  const connectionTimeoutRef = useRef<number | null>(null);

  // Get current user info
  const getCurrentUser = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        id: user.id || 'user_' + Math.random().toString(36).slice(2, 9),
        name: user.name || 'Anonymous',
        email: user.email || 'user@example.com',
      };
    } catch {
      return {
        id: 'user_' + Math.random().toString(36).slice(2, 9),
        name: 'Anonymous',
        email: 'user@example.com',
      };
    }
  }, []);

  // Connect to STOMP WebSocket - FIXED: Thêm cleanup và stability
  useEffect(() => {
    if (!isShared || !noteId || !editor) {
      return;
    }

    const currentUser = getCurrentUser();
    let mounted = true;

    console.log('🔌 Connecting to collaboration service...');

    // Handle cursor updates from other users - FIXED: Thêm validation mạnh mẽ
    const handleCursorUpdate = (message: CursorUpdateMessage) => {
      if (!mounted) return;
      
      try {
        const currentUserId = getCurrentUser().id;
        
        // Ignore own cursor updates
        if (message.userId === currentUserId) return;

        // ✅ FIXED: Validate message data
        if (!message.userId || !message.name || message.position === undefined) {
          console.warn('⚠️ Invalid cursor update message:', message);
          return;
        }

        setCursorUsers((prev: CollaborativeUser[]) => {
          const filtered = prev.filter((u: CollaborativeUser) => u.id !== message.userId);
          
          // ✅ FIXED: Ensure valid cursor position
          const validPosition = Math.max(0, message.position || 0);
          
          return [
            ...filtered,
            {
              id: message.userId,
              name: message.name || 'Unknown',
              email: message.email || 'unknown@example.com',
              color: message.color || '#FF6B6B',
              cursor: { pos: validPosition },
            },
          ];
        });
      } catch (error) {
        console.error('❌ Error handling cursor update:', error);
      }
    };

    // Handle selection updates - FIXED: Thêm validation mạnh mẽ
    const handleSelectionUpdate = (message: SelectionMessage) => {
      if (!mounted) return;
      
      try {
        const currentUserId = getCurrentUser().id;
        
        // Ignore own selection
        if (message.userId === currentUserId) return;

        // ✅ FIXED: Validate message data
        if (!message.userId || !message.selection) {
          console.warn('⚠️ Invalid selection update message:', message);
          return;
        }

        // Validate selection range
        const start = Math.max(0, message.selection.start || 0);
        const end = Math.max(0, message.selection.end || 0);
        
        if (start >= end) {
          return; // Invalid selection range
        }

        setCursorUsers((prev: CollaborativeUser[]) => {
          const filtered = prev.filter((u: CollaborativeUser) => u.id !== message.userId);
          return [
            ...filtered,
            {
              id: message.userId,
              name: message.name || 'Unknown',
              email: message.email || 'unknown@example.com',
              color: message.color || '#FF6B6B',
              selection: {
                from: start,
                to: end,
              },
            },
          ];
        });
      } catch (error) {
        console.error('❌ Error handling selection update:', error);
      }
    };

    // Delayed connection to avoid race conditions
    connectionTimeoutRef.current = setTimeout(() => {
      if (!mounted) return;

      // Connect to STOMP WebSocket
      collabSocketService.connect(
        noteId,
        () => {}, // onMessageReceived - not needed for cursor/selection
        undefined, // onUserJoin
        undefined, // onUserLeave
        handleCursorUpdate,
        undefined, // onPresenceUpdate
        undefined, // onTypingUpdate - REMOVED
        handleSelectionUpdate,
        () => {
          if (!mounted) return;
          console.log('✅ Connected to collaboration service');
          setIsConnected(true);
          
          // Send initial join event
          collabSocketService.sendUserJoin(
            noteId,
            currentUser.id,
            currentUser.email,
            currentUser.name
          );
        }
      );
    }, 1000); // Increased delay to ensure stability

    return () => {
      mounted = false;
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      console.log('🔌 Disconnecting from collaboration service...');
      collabSocketService.sendUserLeave(noteId, currentUser.id);
      collabSocketService.disconnect();
      setIsConnected(false);
      setCursorUsers([]);
      
      // Clear timeouts
      if (cursorUpdateTimeoutRef.current) {
        clearTimeout(cursorUpdateTimeoutRef.current);
      }
      if (selectionUpdateTimeoutRef.current) {
        clearTimeout(selectionUpdateTimeoutRef.current);
      }
    };
  }, [isShared, noteId, editor, getCurrentUser]);

  // Track cursor position changes - FIXED: Improved error handling
  useEffect(() => {
    if (!isConnected || !editor || !isShared) return;

    const handleSelectionUpdate = () => {
      try {
        const { from } = editor.state.selection;
        const currentUser = getCurrentUser();

        // Validate position
        if (from < 0 || from > editor.state.doc.content.size) {
          return;
        }

        // Debounce cursor updates (150ms)
        if (cursorUpdateTimeoutRef.current) {
          clearTimeout(cursorUpdateTimeoutRef.current);
        }

        cursorUpdateTimeoutRef.current = setTimeout(() => {
          // Only send if position changed
          if (lastCursorPos.current !== from) {
            lastCursorPos.current = from;
            
            collabSocketService.sendCursorUpdate(
              noteId,
              currentUser.id,
              currentUser.email,
              currentUser.name,
              from
            );
          }
        }, 150);
      } catch (error) {
        console.error('❌ Error tracking cursor position:', error);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      if (cursorUpdateTimeoutRef.current) {
        clearTimeout(cursorUpdateTimeoutRef.current);
      }
    };
  }, [isConnected, editor, noteId, isShared, getCurrentUser]);

  // Track text selection changes - FIXED: Improved error handling và debouncing
  useEffect(() => {
    if (!isConnected || !editor || !isShared) return;

    const handleSelectionUpdate = () => {
      try {
        const { from, to } = editor.state.selection;
        const currentUser = getCurrentUser();

        // Validate positions
        if (from < 0 || to < 0 || from > editor.state.doc.content.size || to > editor.state.doc.content.size) {
          return;
        }

        // Only send if there's an actual selection (not just cursor)
        if (from === to) {
          // Clear previous selection if any
          if (lastSelection.current) {
            lastSelection.current = null;
          }
          return;
        }

        // Debounce selection updates (200ms)
        if (selectionUpdateTimeoutRef.current) {
          clearTimeout(selectionUpdateTimeoutRef.current);
        }

        selectionUpdateTimeoutRef.current = setTimeout(() => {
          // Only send if selection changed
          const selectionChanged = 
            !lastSelection.current ||
            lastSelection.current.from !== from ||
            lastSelection.current.to !== to;

          if (selectionChanged) {
            lastSelection.current = { from, to };
            
            const selectedText = editor.state.doc.textBetween(from, to);
            
            collabSocketService.sendSelectionUpdate(noteId, {
              start: from,
              end: to,
              text: selectedText,
            });
          }
        }, 200);
      } catch (error) {
        console.error('❌ Error tracking text selection:', error);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      if (selectionUpdateTimeoutRef.current) {
        clearTimeout(selectionUpdateTimeoutRef.current);
      }
    };
  }, [isConnected, editor, noteId, isShared, getCurrentUser]);

  return {
    cursorUsers,
    isConnected,
  };
};