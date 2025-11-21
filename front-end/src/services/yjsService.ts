import { WebsocketProvider } from 'y-websocket';
import { Doc } from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

export class YjsService {
  private doc: Doc;
  private provider: WebsocketProvider | null = null;
  private persistence: IndexeddbPersistence | null = null;

  constructor(documentId: string) {
    this.doc = new Doc();
    this.setupPersistence(documentId);
  }

  private setupPersistence(documentId: string) {
    // Offline persistence
    try {
      this.persistence = new IndexeddbPersistence(documentId, this.doc);
      
      this.persistence.on('synced', () => {
        console.log('✅ Content loaded from database');
      });

      this.persistence.on('error', (error: any) => {
        console.error('❌ IndexedDB persistence error:', error);
      });
    } catch (error) {
      console.error('❌ Failed to setup IndexedDB persistence:', error);
    }
  }

  connectWebSocket(documentId: string, user: any) {
    if (this.provider) {
      this.provider.disconnect();
    }

    try {
      // Sử dụng endpoint raw WebSocket cho Yjs
      const wsUrl = `ws://localhost:8083/yjs-ws?documentId=${documentId}`;
      this.provider = new WebsocketProvider(wsUrl, documentId, this.doc, {
        connect: true,
      });

      // Set user awareness
      this.provider.awareness.setLocalState({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          color: this.generateUserColor(user.id),
        },
        cursor: null,
        selection: null,
      });

      // Event listeners
      this.provider.on('status', (event: any) => {
        console.log('🔌 Yjs WebSocket status:', event.status);
      });

      this.provider.on('sync', (isSynced: boolean) => {
        console.log('🔄 Yjs sync status:', isSynced);
      });

      this.provider.on('connection-close', (event: any) => {
        console.warn('🔌 Yjs connection closed:', event);
      });

      this.provider.on('connection-error', (event: any) => {
        console.error('❌ Yjs connection error:', event);
      });

      console.log('✅ Yjs WebSocket connected successfully');
      return this.provider;
    } catch (error) {
      console.error('❌ Failed to connect Yjs WebSocket:', error);
      return null;
    }
  }

  getDocument() {
    return this.doc;
  }

  getAwareness() {
    return this.provider?.awareness;
  }

  disconnect() {
    try {
      this.provider?.disconnect();
      this.persistence?.destroy();
      console.log('✅ Yjs service disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Yjs service:', error);
    }
  }

  private generateUserColor(userId: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }
}