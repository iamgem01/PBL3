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

  // Connect to STOMP WebSocket
  useEffect(() => {
    if (!isShared || !noteId || !editor) {
      return;
    }

    const currentUser = getCurrentUser();

    console.log('🔌 Connecting to collaboration service...');

    // Handle cursor updates from other users
    const handleCursorUpdate = (message: CursorUpdateMessage) => {
      const currentUserId = getCurrentUser().id;
      
      // Ignore own cursor updates
      if (message.userId === currentUserId) return;

      setCursorUsers((prev: CollaborativeUser[]) => {
        const filtered = prev.filter((u: CollaborativeUser) => u.id !== message.userId);
        return [
          ...filtered,
          {
            id: message.userId,
            name: message.name,
            email: message.email,
            color: message.color,
            cursor: { pos: message.position },
          },
        ];
      });
    };

    // Handle selection updates
    const handleSelectionUpdate = (message: SelectionMessage) => {
      const currentUserId = getCurrentUser().id;
      
      // Ignore own selection
      if (message.userId === currentUserId) return;

      setCursorUsers((prev: CollaborativeUser[]) => {
        const filtered = prev.filter((u: CollaborativeUser) => u.id !== message.userId);
        return [
          ...filtered,
          {
            id: message.userId,
            name: message.name,
            email: message.email,
            color: message.color,
            selection: {
              from: message.selection.start,
              to: message.selection.end,
            },
          },
        ];
      });
    };

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

    return () => {
      console.log('🔌 Disconnecting from collaboration service...');
      collabSocketService.sendUserLeave(noteId, currentUser.id);
      collabSocketService.disconnect();
      setIsConnected(false);
      setCursorUsers([]);
    };
  }, [isShared, noteId, editor, getCurrentUser]);

  // Track cursor position changes
  useEffect(() => {
    if (!isConnected || !editor || !isShared) return;

    const handleSelectionUpdate = () => {
      const { from } = editor.state.selection;
      const currentUser = getCurrentUser();

      // Debounce cursor updates (100ms)
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
      }, 100);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      if (cursorUpdateTimeoutRef.current) {
        clearTimeout(cursorUpdateTimeoutRef.current);
      }
    };
  }, [isConnected, editor, noteId, isShared, getCurrentUser]);

  // Track text selection changes
  useEffect(() => {
    if (!isConnected || !editor || !isShared) return;

    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      const currentUser = getCurrentUser();

      // Only send if there's an actual selection (not just cursor)
      if (from === to) {
        // Clear previous selection if any
        if (lastSelection.current) {
          lastSelection.current = null;
        }
        return;
      }

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
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [isConnected, editor, noteId, isShared, getCurrentUser]);

  return {
    cursorUsers,
    isConnected,
  };
};