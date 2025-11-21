// yjsService.ts - FIXED: Đảm bảo persistence sync trước khi kết nối
import { WebsocketProvider } from 'y-websocket';
import { Doc } from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { Awareness } from 'y-protocols/awareness';

// ✅ ĐÚNG: Lấy base URL từ env, thêm /yjs-ws
const COLLAB_WS_BASE = import.meta.env.VITE_COLLAB_SERVICE_URL || 'http://localhost:8083';
const COLLAB_WS_URL = COLLAB_WS_BASE.replace('http', 'ws') + '/yjs-ws';

console.log('🔧 Yjs WebSocket URL:', COLLAB_WS_URL);

export class YjsService {
  private doc: Doc;
  private provider: WebsocketProvider | null = null;
  private persistence: IndexeddbPersistence | null = null;
  private awareness: Awareness | null = null;
  private isAwarenessReady: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private persistencePromise: Promise<void> | null = null;

  constructor(documentId: string) {
    this.doc = new Doc();
    this.setupPersistence(documentId);
  }

  private setupPersistence(documentId: string) {
    try {
      this.persistence = new IndexeddbPersistence(documentId, this.doc);
      
      // ✅ Tạo promise để đợi persistence sync
      this.persistencePromise = new Promise((resolve, reject) => {
        const onSynced = () => {
          console.log('✅ Content loaded from IndexedDB');
          this.persistence!.off('synced', onSynced);
          this.persistence!.off('error', onError);
          resolve();
        };

        const onError = (error: any) => {
          console.error('❌ IndexedDB persistence error:', error);
          this.persistence!.off('synced', onSynced);
          this.persistence!.off('error', onError);
          reject(error);
        };

        this.persistence!.on('synced', onSynced);
        this.persistence!.on('error', onError);

        // Fallback: nếu đã synced rồi
        if (this.persistence!.synced) {
          console.log('✅ Persistence already synced');
          this.persistence!.off('synced', onSynced);
          this.persistence!.off('error', onError);
          resolve();
        }
      });

    } catch (error) {
      console.error('❌ Failed to setup IndexedDB persistence:', error);
      this.persistencePromise = Promise.resolve();
    }
  }

  async waitForPersistence(): Promise<void> {
    if (this.persistencePromise) {
      await this.persistencePromise;
    }
    return Promise.resolve();
  }

  connectWebSocket(documentId: string, user: any): Promise<{ awareness: Awareness; provider: WebsocketProvider }> {
    return new Promise(async (resolve, reject) => {
      if (this.provider) {
        console.log('⚠️ Disconnecting existing provider...');
        this.provider.disconnect();
        this.provider = null;
        this.awareness = null;
        this.isAwarenessReady = false;
      }

      try {
        const cleanDocId = documentId.split('/').pop() || documentId;
        
        // ✅ QUAN TRỌNG: Đợi persistence sync trước khi kết nối WebSocket
        console.log('⏳ Waiting for persistence to sync...');
        await this.waitForPersistence();
        console.log('✅ Persistence synced, connecting WebSocket...');

        // ✅ CRITICAL FIX: y-websocket appends room name to URL
        const wsUrlWithParam = `${COLLAB_WS_URL}?documentId=${cleanDocId}`;
        
        console.log('🔌 Connecting to Yjs WebSocket:', {
          wsUrlWithParam,
          documentId: cleanDocId,
          user: user.email
        });

        // Create provider - PASS EMPTY STRING as room name to avoid double path
        this.provider = new WebsocketProvider(
          wsUrlWithParam,
          '',
          this.doc,
          {
            connect: true,
          }
        );

        // Get awareness
        this.awareness = this.provider.awareness;

        if (!this.awareness) {
          throw new Error('Failed to get awareness from provider');
        }

        // ✅ FIX: Khởi tạo awareness state với delay để đảm bảo document đã sẵn sàng
        setTimeout(() => {
          try {
            this.awareness!.setLocalState({
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                color: this.generateUserColor(user.id),
              },
              cursor: null,
              selection: null,
            });
            console.log('✅ Awareness state set for:', user.email);
          } catch (error) {
            console.error('❌ Error setting awareness state:', error);
          }
        }, 100);

        console.log('✅ Awareness created for:', user.email);

        // Mark as ready
        this.isAwarenessReady = true;
        this.reconnectAttempts = 0;

        // Setup event listeners
        this.provider.on('status', (event: any) => {
          console.log('📡 Yjs WebSocket status:', event.status);
          
          if (event.status === 'connected') {
            console.log('✅ Yjs WebSocket CONNECTED successfully');
            this.reconnectAttempts = 0;
          } else if (event.status === 'disconnected') {
            console.warn('⚠️ Yjs WebSocket DISCONNECTED');
            this.handleReconnect(cleanDocId, user);
          }
        });

        this.provider.on('sync', (isSynced: boolean) => {
          console.log('🔄 Yjs sync status:', isSynced ? '✅ Synced' : '⏳ Syncing...');
        });

        this.provider.on('connection-close', (event: any) => {
          console.warn('🔌 Yjs connection closed:', event);
        });

        this.provider.on('connection-error', (event: any) => {
          console.error('❌ Yjs connection error:', event);
        });

        // Return both awareness AND provider
        console.log('✅ Returning awareness and provider');
        resolve({
          awareness: this.awareness,
          provider: this.provider
        });

      } catch (error) {
        console.error('❌ Failed to connect Yjs WebSocket:', error);
        this.isAwarenessReady = false;
        reject(error);
      }
    });
  }

  private handleReconnect(documentId: string, user: any) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
      
      setTimeout(() => {
        if (this.provider && !this.provider.wsconnected) {
          console.log('🔌 Reconnecting WebSocket...');
          this.provider.connect();
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Giving up.');
    }
  }

  getDocument() {
    return this.doc;
  }

  getAwareness(): Awareness | null {
    return this.awareness;
  }

  getProvider(): WebsocketProvider | null {
    return this.provider;
  }

  isAwarenessReady_(): boolean {
    return this.isAwarenessReady && this.awareness !== null;
  }

  isConnected(): boolean {
    return this.provider?.wsconnected || false;
  }

  disconnect() {
    try {
      this.isAwarenessReady = false;
      this.reconnectAttempts = 0;

      if (this.provider) {
        this.provider.disconnect();
        this.provider.destroy();
        this.provider = null;
      }
      
      if (this.persistence) {
        this.persistence.destroy();
        this.persistence = null;
      }

      this.awareness = null;
      this.persistencePromise = null;

      console.log('✅ Yjs service disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Yjs service:', error);
    }
  }

  private generateUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }
}