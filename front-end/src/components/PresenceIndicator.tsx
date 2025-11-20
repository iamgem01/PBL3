import React from 'react';
import { User, Wifi, WifiOff, Clock } from 'lucide-react';

interface UserPresence {
    userId: string;
    name: string;
    email: string;
    status: 'ONLINE' | 'AWAY' | 'OFFLINE' | 'TYPING';
    lastSeen: number;
    color: string;
}

interface PresenceIndicatorProps {
    users: UserPresence[];
    maxDisplay?: number;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ 
    users, 
    maxDisplay = 5 
}) => {
    const onlineUsers = users.filter(u => u.status === 'ONLINE');
    const typingUsers = users.filter(u => u.status === 'TYPING');
    
    return (
        <div className="flex items-center space-x-2 px-3 py-2 bg-white border-b">
            {/* Online users */}
            <div className="flex -space-x-2">
                {onlineUsers.slice(0, maxDisplay).map((user) => (
                    <div
                        key={user.userId}
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: user.color }}
                        title={`${user.name} (${user.status.toLowerCase()})`}
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                ))}
                {onlineUsers.length > maxDisplay && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium">
                        +{onlineUsers.length - maxDisplay}
                    </div>
                )}
            </div>
            
            {/* Status text */}
            <div className="text-sm text-gray-600">
                {typingUsers.length > 0 ? (
                    <span className="text-blue-600 font-medium">
                        {typingUsers.length === 1 
                            ? `${typingUsers[0].name} is typing...`
                            : `${typingUsers.length} people are typing...`
                        }
                    </span>
                ) : (
                    <span>
                        {onlineUsers.length} online
                    </span>
                )}
            </div>
        </div>
    );
};