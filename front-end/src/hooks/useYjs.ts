import { useState, useEffect, useCallback } from 'react';
import { YjsService } from '@/services/yjsService';
import { Doc } from 'yjs';

// Interface cho user presence
interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: { pos: number };
  selection?: { from: number; to: number };
}

// Interface cho awareness update
interface AwarenessUpdate {
  cursor: { pos: number } | null;
  selection: { from: number; to: number } | null;
}

export const useYjs = (documentId: string, isShared: boolean) => {
  const [yjsService, setYjsService] = useState<YjsService | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<CollaborativeUser[]>([]);

  useEffect(() => {
    if (!documentId) return;

    const service = new YjsService(documentId);
    setYjsService(service);
    setDoc(service.getDocument());

    if (isShared) {
      // Get current user from localStorage or auth context
      const currentUser = JSON.parse(localStorage.getItem('user') || '{"id": "user_001", "name": "Current User", "email": "user@example.com"}');
      service.connectWebSocket(documentId, currentUser);
      setConnected(true);
    }

    return () => {
      service.disconnect();
    };
  }, [documentId, isShared]);

  const updateAwareness = useCallback((cursor: { pos: number } | null, selection: { from: number; to: number } | null) => {
    if (!yjsService) return;
    
    const awareness = yjsService.getAwareness();
    if (awareness) {
      awareness.setLocalStateField('cursor', cursor);
      awareness.setLocalStateField('selection', selection);
    }
  }, [yjsService]);

  // Listen for awareness changes
  useEffect(() => {
    if (!yjsService || !isShared) return;

    const awareness = yjsService.getAwareness();
    if (!awareness) return;

    const handleAwarenessChange = () => {
      const states = Array.from(awareness.getStates().values());
      const otherUsers: CollaborativeUser[] = states
        .filter((state: any) => state.user && state.user.id !== 'user_001') // Filter out current user
        .map((state: any) => ({
          ...state.user,
          cursor: state.cursor,
          selection: state.selection,
        }));
      
      setUsers(otherUsers);
    };

    awareness.on('change', handleAwarenessChange);
    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [yjsService, isShared]);

  return {
    doc,
    connected,
    users,
    updateAwareness,
    yjsService,
  };
};