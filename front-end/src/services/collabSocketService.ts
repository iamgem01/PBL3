import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
const BASE_URL = import.meta.env.VITE_COLLAB_SERVICE_URL || 'http://localhost:8083';
const BROKER_URL = `${BASE_URL}/ws-collab`;

export interface NoteUpdateMessage {
    noteId: string;
    content: string;
    senderId: string;
    type: 'EDIT' | 'CURSOR';
}

class CollabSocketService {
    private client: Client | null = null;
    private onMessageCallback: (message: NoteUpdateMessage) => void = () => {};

    connect(noteId: string, onMessageReceived: (msg: NoteUpdateMessage) => void) {
        // Lưu callback để gọi khi nhận tin nhắn
        this.onMessageCallback = onMessageReceived;

        this.client = new Client({
            // Sử dụng SockJS để tương thích trình duyệt tốt hơn
            webSocketFactory: () => new SockJS(BROKER_URL),
            
            // Tự động kết nối lại sau 5s nếu mất mạng
            reconnectDelay: 5000, 
            
            // Log debug (chỉ hiện khi ở mode Development)
            debug: (str) => {
                if (import.meta.env.DEV) {
                    console.log('[WS Debug]:', str);
                }
            },

            onConnect: () => {
                console.log(`✅ Connected to Collab Service at ${BROKER_URL}`);
                
                // Subscribe vào topic của note cụ thể
                // Backend: @SendTo("/topic/note/{noteId}")
                this.client?.subscribe(`/topic/note/${noteId}`, (message: IMessage) => {
                    if (message.body) {
                        try {
                            const parsedMessage: NoteUpdateMessage = JSON.parse(message.body);
                            this.onMessageCallback(parsedMessage);
                        } catch (e) {
                            console.error('❌ Error parsing message JSON:', e);
                        }
                    }
                });
            },

            onStompError: (frame) => {
                console.error('❌ Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        this.client.activate();
    }

    // Gửi tin nhắn cập nhật note lên server
    // Backend: @MessageMapping("/note.edit/{noteId}")
    sendNoteUpdate(noteId: string, content: string, senderId: string) {
        if (this.client && this.client.connected) {
            const payload: NoteUpdateMessage = {
                noteId,
                content,
                senderId,
                type: 'EDIT'
            };
            
            this.client.publish({
                destination: `/app/note.edit/${noteId}`,
                body: JSON.stringify(payload),
            });
        } else {
            console.warn('⚠️ Cannot send message: WebSocket is not connected');
        }
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            console.log('🔌 Disconnected WebSocket');
        }
    }
}

// Export singleton instance
export const collabSocketService = new CollabSocketService();