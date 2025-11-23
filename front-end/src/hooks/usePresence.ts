import { useState, useEffect, useCallback } from 'react';
import { collabSocketService } from '@/services/collabSocketService';
import type { PresenceMessage, TypingMessage } from '@/services/collabSocketService';

interface UserPresence {
    userId: string;
    name: string;
    email: string;
    status: 'ONLINE' | 'AWAY' | 'OFFLINE' | 'TYPING';
    lastSeen: number;
    color: string;
}

export const usePresence = (noteId: string) => {
    const [users, setUsers] = useState<UserPresence[]>([]);
    const [typingUsers, setTypingUsers] = useState<UserPresence[]>([]);

    const updatePresence = useCallback((presence: PresenceMessage) => {
        setUsers(prev => {
            const existing = prev.find(u => u.userId === presence.userId);
            if (existing) {
                return prev.map(u => 
                    u.userId === presence.userId 
                        ? { ...u, status: presence.status, lastSeen: presence.lastSeen }
                        : u
                );
            } else {
                return [...prev, {
                    userId: presence.userId,
                    name: presence.name,
                    email: presence.email,
                    status: presence.status,
                    lastSeen: presence.lastSeen,
                    color: generateColor(presence.userId)
                }];
            }
        });
    }, []);

    const updateTyping = useCallback((typing: TypingMessage) => {
        if (typing.isTyping) {
            setTypingUsers(prev => {
                const existing = prev.find(u => u.userId === typing.userId);
                if (!existing) {
                    return [...prev, {
                        userId: typing.userId,
                        name: typing.name,
                        email: typing.email,
                        status: 'TYPING',
                        lastSeen: typing.timestamp,
                        color: generateColor(typing.userId)
                    }];
                }
                return prev;
            });
        } else {
            setTypingUsers(prev => prev.filter(u => u.userId !== typing.userId));
        }
    }, []);

    useEffect(() => {
        // Send initial presence
        collabSocketService.sendPresenceUpdate(noteId, 'ONLINE');
        
        // Setup presence tracking
        collabSocketService.connect(
            noteId,
            () => {}, // onMessage
            () => {}, // onUserJoin
            () => {}, // onUserLeave
            () => {}, // onCursorUpdate
            updatePresence, // onPresenceUpdate
            updateTyping    // onTypingUpdate
        );
        
        return () => {
            collabSocketService.sendPresenceUpdate(noteId, 'OFFLINE');
            collabSocketService.disconnect();
        };
    }, [noteId, updatePresence, updateTyping]);

    return { users, typingUsers };
};
const generateColor = (userId: string): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};
