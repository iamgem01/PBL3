import { useState, useEffect, useCallback, useRef } from 'react';
import { YjsService } from '@/services/yjsService';
import { Doc } from 'yjs';
import type { Awareness } from 'y-protocols/awareness';
import type { WebsocketProvider } from 'y-websocket';

interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: { pos: number };
  selection?: { from: number; to: number };
}

export const useYjs = (documentId: string, isShared: boolean) => {
  const [yjsService, setYjsService] = useState<YjsService | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connected, setConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [persistenceReady, setPersistenceReady] = useState(false);
  const [users, setUsers] = useState<CollaborativeUser[]>([]);
  
  const initializingRef = useRef(false);
  const serviceRef = useRef<YjsService | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!documentId || initializingRef.current) return;

    const cleanDocId = documentId.split('/').pop() || documentId;
    initializingRef.current = true;
    setIsSynced(false);
    setPersistenceReady(false);

    const initialize = async () => {
      try {
        const service = new YjsService(cleanDocId);
        serviceRef.current = service;
        
        setYjsService(service);
        setDoc(service.getDocument());

        // âœ… Äá»¢I PERSISTENCE SYNC TRÆ¯á»šC KHI TIáº¾P Tá»¤C
        console.log('â³ Waiting for persistence sync...');
        await service.waitForPersistence();
        console.log('âœ… Persistence ready, continuing initialization...');
        setPersistenceReady(true);

        if (isShared) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          // Fallback user info
          if (!currentUser.id) currentUser.id = 'user_' + Math.random().toString(36).slice(2, 9);
          if (!currentUser.name) currentUser.name = 'Anonymous';
          
          try {
            const result = await service.connectWebSocket(cleanDocId, currentUser);
            
            setAwareness(result.awareness);
            setProvider(result.provider);
            
            // âœ… FIX: Äáº£m báº£o awareness Ä‘Æ°á»£c thiáº¿t láº­p Ä‘Ãºng cÃ¡ch
            setTimeout(() => {
              if (result.awareness) {
                try {
                  result.awareness.setLocalState({
                    user: currentUser,
                    cursor: null,
                    selection: null,
                  });
                  console.log('âœ… Initial awareness state set');
                } catch (error) {
                  console.error('âŒ Error setting initial awareness state:', error);
                }
              }
            }, 100);
            
            // âœ… Láº¯ng nghe sá»± kiá»‡n sync tá»« provider
            result.provider.on('sync', (synced: boolean) => {
              console.log('ðŸ”„ Yjs Provider Synced:', synced);
              setIsSynced(synced);
            });

            await new Promise(resolve => setTimeout(resolve, 100));
            setConnected(true);
            retryCount.current = 0;
            
          } catch (error) {
            console.error('âŒ WebSocket connection failed:', error);
            if (retryCount.current < maxRetries) {
              retryCount.current++;
              const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
              retryTimeoutRef.current = window.setTimeout(() => {
                initializingRef.current = false;
                initialize();
              }, delay);
            } else {
              setConnected(false);
            }
          }
        } else {
          setConnected(true);
          setIsSynced(true);
        }
      } catch (error) {
        console.error('âŒ Failed to initialize Yjs:', error);
        initializingRef.current = false;
      }
    };

    initialize();

    cleanupRef.current = () => {
      initializingRef.current = false;
      retryCount.current = 0;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (serviceRef.current) {
        serviceRef.current.disconnect();
        serviceRef.current = null;
      }
      setAwareness(null);
      setProvider(null);
      setConnected(false);
      setIsSynced(false);
      setPersistenceReady(false);
    };

    return cleanupRef.current;
  }, [documentId, isShared]);

  const updateAwareness = useCallback((
    cursor: { pos: number } | null, 
    selection: { from: number; to: number } | null
  ) => {
    if (!awareness) return;
    try {
      // âœ… FIX: Äáº£m báº£o chá»‰ update khi awareness Ä‘Ã£ sáºµn sÃ ng
      const currentState = awareness.getLocalState();
      if (currentState) {
        awareness.setLocalState({
          ...currentState,
          cursor,
          selection,
        });
      }
    } catch (error) {
      console.error('âŒ Failed to update awareness:', error);
    }
  }, [awareness]);

  useEffect(() => {
    if (!awareness || !isShared) return;

    const handleAwarenessChange = () => {
      try {
        const states = Array.from(awareness.getStates().values());
        const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        // âœ… FIX: Sá»­ dá»¥ng Set Ä‘á»ƒ loáº¡i bá» duplicate users
        const uniqueUsers = new Map();
        
        states.forEach((state: any) => {
          if (state.user && state.user.id !== currentUserId) {
            uniqueUsers.set(state.user.id, {
              id: state.user.id,
              name: state.user.name,
              email: state.user.email,
              color: state.user.color,
              cursor: state.cursor,
              selection: state.selection,
            });
          }
        });
        
        setUsers(Array.from(uniqueUsers.values()));
      } catch (error) {
        console.error('âŒ Error handling awareness change:', error);
      }
    };

    awareness.on('change', handleAwarenessChange);
    handleAwarenessChange();

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [awareness, isShared]);

  return {
    doc,
    connected,
    isSynced: isSynced && persistenceReady,
    persistenceReady,
    users,
    updateAwareness,
    yjsService,
    awareness,
    provider,
  };
};