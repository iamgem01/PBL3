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
  const [persistenceReady, setPersistenceReady] = useState(false); // ✅ NEW: Trạng thái persistence
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
    setPersistenceReady(false); // ✅ Reset persistence state

    const initialize = async () => {
      try {
        const service = new YjsService(cleanDocId);
        serviceRef.current = service;
        
        setYjsService(service);
        setDoc(service.getDocument());

        // ✅ ĐỢI PERSISTENCE SYNC TRƯỚC KHI TIẾP TỤC
        console.log('⏳ Waiting for persistence sync...');
        await service.waitForPersistence();
        console.log('✅ Persistence ready, continuing initialization...');
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
            
            // ✅ Lắng nghe sự kiện sync từ provider
            result.provider.on('sync', (synced: boolean) => {
              console.log('🔄 Yjs Provider Synced:', synced);
              setIsSynced(synced);
            });

            await new Promise(resolve => setTimeout(resolve, 50));
            setConnected(true);
            retryCount.current = 0;
            
          } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
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
          setIsSynced(true); // Local mode luôn coi là synced
        }
      } catch (error) {
        console.error('❌ Failed to initialize Yjs:', error);
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
      setPersistenceReady(false); // ✅ Reset persistence state
    };

    return cleanupRef.current;
  }, [documentId, isShared]);

  const updateAwareness = useCallback((
    cursor: { pos: number } | null, 
    selection: { from: number; to: number } | null
  ) => {
    if (!awareness) return;
    try {
      awareness.setLocalStateField('cursor', cursor);
      awareness.setLocalStateField('selection', selection);
    } catch (error) {
      console.error('❌ Failed to update awareness:', error);
    }
  }, [awareness]);

  useEffect(() => {
    if (!awareness || !isShared) return;

    const handleAwarenessChange = () => {
      try {
        const states = Array.from(awareness.getStates().values());
        const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        const otherUsers: CollaborativeUser[] = states
          .filter((state: any) => state.user && state.user.id !== currentUserId)
          .map((state: any) => ({
            id: state.user.id,
            name: state.user.name,
            email: state.user.email,
            color: state.user.color,
            cursor: state.cursor,
            selection: state.selection,
          }));
        
        setUsers(otherUsers);
      } catch (error) {
        console.error('❌ Error handling awareness change:', error);
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
    isSynced: isSynced && persistenceReady, // ✅ Chỉ synced khi persistence ready
    persistenceReady, // ✅ Export thêm trạng thái này
    users,
    updateAwareness,
    yjsService,
    awareness,
    provider,
  };
};