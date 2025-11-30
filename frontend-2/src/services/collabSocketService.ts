import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BASE_URL = import.meta.env.VITE_COLLAB_SERVICE_URL || 'http://localhost:8000';
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

export interface PresenceMessage {
    userId: string;
    email: string;
    name: string;
    status: 'ONLINE' | 'AWAY' | 'OFFLINE';
    lastSeen: number;
    timestamp: number;
}

export interface TypingMessage {
    userId: string;
    email: string;
    name: string;
    isTyping: boolean;
    timestamp: number;
}

export interface SelectionMessage {
    userId: string;
    email: string;
    name: string;
    selection: {
        start: number;
        end: number;
        text?: string;
    };
    color: string;
    timestamp: number;
}

class CollabSocketService {
    private client: Client | null = null;
    private onMessageCallback: (message: NoteUpdateMessage) => void = () => {};
    private onUserJoinCallback: (message: UserJoinMessage) => void = () => {};
    private onUserLeaveCallback: (message: UserJoinMessage) => void = () => {};
    private onCursorUpdateCallback: (message: CursorUpdateMessage) => void = () => {};
    private onPresenceCallback: (message: PresenceMessage) => void = () => {};
    private onTypingCallback: (message: TypingMessage) => void = () => {};
    private onSelectionCallback: (message: SelectionMessage) => void = () => {};
    
    private heartbeatInterval: number| null = null;
    private typingTimeout: number | null = null;

    connect(
        noteId: string, 
        onMessageReceived: (msg: NoteUpdateMessage) => void,
        onUserJoin?: (msg: UserJoinMessage) => void,
        onUserLeave?: (msg: UserJoinMessage) => void,
        onCursorUpdate?: (msg: CursorUpdateMessage) => void,
        onPresenceUpdate?: (msg: PresenceMessage) => void,
        onTypingUpdate?: (msg: TypingMessage) => void,
        onSelectionUpdate?: (msg: SelectionMessage) => void,
        onConnected?: () => void
    ) {
        this.onMessageCallback = onMessageReceived;
        this.onUserJoinCallback = onUserJoin || (() => {});
        this.onUserLeaveCallback = onUserLeave || (() => {});
        this.onCursorUpdateCallback = onCursorUpdate || (() => {});
        this.onPresenceCallback = onPresenceUpdate || (() => {});
        this.onTypingCallback = onTypingUpdate || (() => {});
        this.onSelectionCallback = onSelectionUpdate || (() => {});

        this.client = new Client({
            webSocketFactory: () => new SockJS(BROKER_URL),
            connectHeaders: {},
            debug: (str) => console.log('STOMP:', str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Connected to WebSocket:', frame);

            // Subscribe to all topics
            this.subscribeToTopics(noteId);
            
            // Start heartbeat for presence
            this.startHeartbeat(noteId);
            
            if (onConnected) onConnected();
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
        };

        this.client.activate();
    }

    private subscribeToTopics(noteId: string) {
        if (!this.client) return;

        // Existing subscriptions...
        this.client.subscribe(`/topic/note/${noteId}`, (message) => {
            const data = JSON.parse(message.body);
            this.onMessageCallback(data);
        });

        this.client.subscribe(`/topic/note/${noteId}/users`, (message) => {
            const data = JSON.parse(message.body);
            if (data.type === 'JOIN') {
                this.onUserJoinCallback(data);
            } else if (data.type === 'LEAVE') {
                this.onUserLeaveCallback(data);
            }
        });

        this.client.subscribe(`/topic/note/${noteId}/cursor`, (message) => {
            const data = JSON.parse(message.body);
            this.onCursorUpdateCallback(data);
        });

        // New subscriptions for presence features
        this.client.subscribe(`/topic/note/${noteId}/presence`, (message) => {
            const data = JSON.parse(message.body);
            this.onPresenceCallback(data);
        });

        this.client.subscribe(`/topic/note/${noteId}/typing`, (message) => {
            const data = JSON.parse(message.body);
            this.onTypingCallback(data);
        });

        this.client.subscribe(`/topic/note/${noteId}/selection`, (message) => {
            const data = JSON.parse(message.body);
            this.onSelectionCallback(data);
        });
    }

    private startHeartbeat(noteId: string) {
        // Send presence update every 30 seconds
        this.heartbeatInterval = setInterval(() => {
            this.sendPresenceUpdate(noteId, 'ONLINE');
        }, 30000);
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
    // ✅ FIXED: Validate data trước khi gửi
    if (position === undefined || position === null || position < 0) {
      console.warn('⚠️ Invalid cursor position, not sending:', position);
      return;
    }

    const payload: CursorUpdateMessage = {
      userId: userId || 'unknown',
      email: email || 'unknown@example.com',
      name: name || 'Unknown',
      position: Math.max(0, position),
      color: this.getUserColor(),
      timestamp: Date.now()
    };
    
    this.client.publish({
      destination: `/app/ws/note.cursor/${noteId}`,
      body: JSON.stringify(payload),
    });
  }
}

    // Public methods for presence features
    sendPresenceUpdate(noteId: string, status: 'ONLINE' | 'AWAY' | 'OFFLINE') {
        if (!this.client || !this.client.connected) return;

        const presenceMessage = {
            userId: this.getCurrentUserId(),
            email: this.getCurrentUserEmail(),
            name: this.getCurrentUserName(),
            status: status,
            lastSeen: Date.now(),
            timestamp: Date.now()
        };

        this.client.publish({
            destination: `/app/ws/note.presence/${noteId}`,
            body: JSON.stringify(presenceMessage)
        });
    }

    sendTypingIndicator(noteId: string, isTyping: boolean) {
        if (!this.client || !this.client.connected) return;

        const typingMessage = {
            userId: this.getCurrentUserId(),
            email: this.getCurrentUserEmail(),
            name: this.getCurrentUserName(),
            isTyping: isTyping,
            timestamp: Date.now()
        };

        this.client.publish({
            destination: `/app/ws/note.typing/${noteId}`,
            body: JSON.stringify(typingMessage)
        });
    }

    sendSelectionUpdate(noteId: string, selection: { start: number; end: number; text?: string }) {
  if (!this.client || !this.client.connected) return;

  // ✅ FIXED: Validate selection data
  if (!selection || selection.start === undefined || selection.end === undefined) {
    console.warn('⚠️ Invalid selection data, not sending:', selection);
    return;
  }

  const start = Math.max(0, selection.start);
  const end = Math.max(0, selection.end);
  
  if (start >= end) {
    console.warn('⚠️ Invalid selection range, not sending:', { start, end });
    return;
  }

  const selectionMessage = {
    userId: this.getCurrentUserId(),
    email: this.getCurrentUserEmail(),
    name: this.getCurrentUserName(),
    selection: {
      start: start,
      end: end,
      text: selection.text || '',
    },
    color: this.getUserColor(),
    timestamp: Date.now()
  };

  this.client.publish({
    destination: `/app/ws/note.selection/${noteId}`,
    body: JSON.stringify(selectionMessage)
  });
}

    // Debounced typing indicator
    startTyping(noteId: string) {
        this.sendTypingIndicator(noteId, true);
        
        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Stop typing after 1 second of inactivity
        this.typingTimeout = setTimeout(() => {
            this.sendTypingIndicator(noteId, false);
        }, 1000);
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        if (this.client) {
            this.client.deactivate();
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.client?.connected || false;
    }

    // Helper methods (implement these based on your auth system)
    private getCurrentUserId(): string {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).id : 'anonymous';
    }

    private getCurrentUserEmail(): string {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).email : 'anonymous@example.com';
    }

    private getCurrentUserName(): string {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).name : 'Anonymous';
    }

    private getUserColor(): string {
        // Generate or retrieve user color
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
        const userId = this.getCurrentUserId();
        const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    }
}

// Export singleton instance
export const collabSocketService = new CollabSocketService();