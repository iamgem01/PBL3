import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BASE_URL = import.meta.env.VITE_COLLAB_SERVICE_URL || 'http://localhost:8083';
const BROKER_URL = `${BASE_URL}/ws-collab`;

export interface NoteUpdateMessage {
    noteId: string;
    content: string;
    senderId: string;
    senderEmail: string;
    senderName: string;
    type: 'EDIT' | 'CURSOR';
    timestamp: number;
}

export interface UserJoinMessage {
    userId: string;
    email: string;
    name: string;
    color: string;
    type: 'JOIN' | 'LEAVE';
    timestamp: number;
}

export interface CursorUpdateMessage {
    userId: string;
    email: string;
    name: string;
    position: number;
    color: string;
    timestamp: number;
}

class CollabSocketService {
    private client: Client | null = null;
    private onMessageCallback: (message: NoteUpdateMessage) => void = () => {};
    private onUserJoinCallback: (message: UserJoinMessage) => void = () => {};
    private onUserLeaveCallback: (message: UserJoinMessage) => void = () => {};
    private onCursorUpdateCallback: (message: CursorUpdateMessage) => void = () => {};

    connect(
        noteId: string, 
        onMessageReceived: (msg: NoteUpdateMessage) => void,
        onUserJoin?: (msg: UserJoinMessage) => void,
        onUserLeave?: (msg: UserJoinMessage) => void,
        onCursorUpdate?: (msg: CursorUpdateMessage) => void,
        onConnected?: () => void  // Thêm callback này
    ) {
        this.onMessageCallback = onMessageReceived;
        this.onUserJoinCallback = onUserJoin || (() => {});
        this.onUserLeaveCallback = onUserLeave || (() => {});
        this.onCursorUpdateCallback = onCursorUpdate || (() => {});

        this.client = new Client({
            webSocketFactory: () => new SockJS(BROKER_URL),
            reconnectDelay: 5000,
            
            debug: (str) => {
                if (import.meta.env.DEV) {
                    console.log('[WS Debug]:', str);
                }
            },

            onConnect: () => {
                console.log(`✅ Connected to Collab Service at ${BROKER_URL}`);
                
                // ... existing subscription code ...

                console.log('✅ Subscribed to all channels');
                
                // Gọi callback khi đã kết nối thành công
                if (onConnected) {
                    onConnected();
                }
            },

            onStompError: (frame) => {
                console.error('❌ Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        this.client.activate();
    }

    /**
     * Send note content update
     */
    sendNoteUpdate(noteId: string, content: string, senderId: string, senderEmail: string, senderName: string) {
        if (this.client && this.client.connected) {
            const payload: NoteUpdateMessage = {
                noteId,
                content,
                senderId,
                senderEmail,
                senderName,
                type: 'EDIT',
                timestamp: Date.now()
            };
            
            this.client.publish({
                destination: `/app/ws/note.edit/${noteId}`, // Thêm /ws prefix
                body: JSON.stringify(payload),
            });

            console.log('📤 Note update sent');
        } else {
            console.warn('⚠️ Cannot send message: WebSocket is not connected');
        }
    }

    /**
     * Send user join event
     */
    sendUserJoin(noteId: string, userId: string, email: string, name: string) {
        if (this.client && this.client.connected) {
            const payload: UserJoinMessage = {
                userId,
                email,
                name,
                color: '', // Will be assigned by server
                type: 'JOIN',
                timestamp: Date.now()
            };
            
            this.client.publish({
                destination: `/app/ws/note.join/${noteId}`, // Thêm /ws prefix
                body: JSON.stringify(payload),
            });

            console.log('📤 User join event sent');
        } else {
            console.warn('⚠️ Cannot send join: WebSocket is not connected');
        }
    }

    /**
     * Send user leave event
     */
    sendUserLeave(noteId: string, userId: string) {
        if (this.client && this.client.connected) {
            const payload: UserJoinMessage = {
                userId,
                email: '',
                name: '',
                color: '',
                type: 'LEAVE',
                timestamp: Date.now()
            };
            
            this.client.publish({
                destination: `/app/ws/note.leave/${noteId}`, // Thêm /ws prefix
                body: JSON.stringify(payload),
            });

            console.log('📤 User leave event sent');
        } else {
            console.warn('⚠️ Cannot send leave: WebSocket is not connected');
        }
    }

    /**
     * Send cursor position update
     */
    sendCursorUpdate(noteId: string, userId: string, email: string, name: string, position: number) {
        if (this.client && this.client.connected) {
            const payload: CursorUpdateMessage = {
                userId,
                email,
                name,
                position,
                color: '', // Will be set by server
                timestamp: Date.now()
            };
            
            this.client.publish({
                destination: `/app/ws/note.cursor/${noteId}`, // Thêm /ws prefix
                body: JSON.stringify(payload),
            });
        }
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        if (this.client) {
            this.client.deactivate();
            console.log('🔌 Disconnected WebSocket');
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.client?.connected || false;
    }
}

// Export singleton instance
export const collabSocketService = new CollabSocketService();