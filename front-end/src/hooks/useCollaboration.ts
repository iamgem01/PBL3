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

  // Connect to STOMP WebSocket - FIXED: Thêm validation mạnh mẽ hơn
  useEffect(() => {
    if (!isShared || !noteId || !editor) {
      return;
    }

    const currentUser = getCurrentUser();
    let mounted = true;

    console.log('🔌 Connecting to collaboration service...');

    // Handle cursor updates from other users - FIXED: Thêm validation cực kỳ mạnh mẽ
    const handleCursorUpdate = (message: CursorUpdateMessage) => {
      if (!mounted) return;
      
      try {
        // ✅ FIXED: Validate message structure cực kỹ
        if (!message || typeof message !== 'object') {
          console.warn('⚠️ Invalid cursor message: not an object');
          return;
        }

        const currentUserId = getCurrentUser().id;
        
        // Ignore own cursor updates
        if (message.userId === currentUserId) return;

        // ✅ FIXED: Validate required fields
        if (!message.userId || typeof message.userId !== 'string') {
          console.warn('⚠️ Invalid cursor message: missing userId');
          return;
        }

        if (message.position === undefined || message.position === null) {
          console.warn('⚠️ Invalid cursor message: missing position');
          return;
        }

        // ✅ FIXED: Validate position type and range
        const position = Number(message.position);
        if (isNaN(position) || position < 0) {
          console.warn('⚠️ Invalid cursor position:', message.position);
          return;
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
              cursor: { pos: position },
            },
          ];
        });
      } catch (error) {
        console.error('❌ Error handling cursor update:', error);
      }
    };

    // Handle selection updates - FIXED: Thêm validation cực kỳ mạnh mẽ
    const handleSelectionUpdate = (message: SelectionMessage) => {
      if (!mounted) return;
      
      try {
        // ✅ FIXED: Validate message structure cực kỹ
        if (!message || typeof message !== 'object') {
          console.warn('⚠️ Invalid selection message: not an object');
          return;
        }

        const currentUserId = getCurrentUser().id;
        
        // Ignore own selection
        if (message.userId === currentUserId) return;

        // ✅ FIXED: Validate required fields
        if (!message.userId || typeof message.userId !== 'string') {
          console.warn('⚠️ Invalid selection message: missing userId');
          return;
        }

        if (!message.selection || typeof message.selection !== 'object') {
          console.warn('⚠️ Invalid selection message: missing selection object');
          return;
        }

        // Validate selection range
        const start = Number(message.selection.start);
        const end = Number(message.selection.end);
        
        if (isNaN(start) || isNaN(end) || start < 0 || end < 0 || start >= end) {
          console.warn('⚠️ Invalid selection range:', { start, end });
          return;
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
    }, 1500); // Increased delay to ensure stability

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

  // Track cursor position changes - FIXED: Improved error handling và validation
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

        // Debounce cursor updates (200ms) - Increased for stability
        if (cursorUpdateTimeoutRef.current) {
          clearTimeout(cursorUpdateTimeoutRef.current);
        }

        cursorUpdateTimeoutRef.current = setTimeout(() => {
          // Only send if position changed significantly (avoid spam)
          if (lastCursorPos.current === null || Math.abs(lastCursorPos.current - from) > 1) {
            lastCursorPos.current = from;
            
            collabSocketService.sendCursorUpdate(
              noteId,
              currentUser.id,
              currentUser.email,
              currentUser.name,
              from
            );
          }
        }, 200);
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
        getCurrentUser();

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

        // Debounce selection updates (300ms) - Increased for stability
        if (selectionUpdateTimeoutRef.current) {
          clearTimeout(selectionUpdateTimeoutRef.current);
        }

        selectionUpdateTimeoutRef.current = setTimeout(() => {
          // Only send if selection changed significantly
          const selectionChanged = 
            !lastSelection.current ||
            Math.abs(lastSelection.current.from - from) > 1 ||
            Math.abs(lastSelection.current.to - to) > 1;

          if (selectionChanged) {
            lastSelection.current = { from, to };
            
            const selectedText = editor.state.doc.textBetween(from, to);
            
            collabSocketService.sendSelectionUpdate(noteId, {
              start: from,
              end: to,
              text: selectedText,
            });
          }
        }, 300);
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