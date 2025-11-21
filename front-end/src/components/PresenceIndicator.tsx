import React from 'react';
import { User, Clock } from 'lucide-react';

interface UserPresence {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: any;
  selection?: any;
}

interface PresenceIndicatorProps {
  users: UserPresence[];
  maxDisplay?: number;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ 
  users, 
  maxDisplay = 5 
}) => {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg">
      {/* Online users avatars */}
      <div className="flex -space-x-2">
        {users.slice(0, maxDisplay).map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white relative"
            style={{ backgroundColor: user.color }}
            title={`${user.name} (${user.email})`}
          >
            {user.name.charAt(0).toUpperCase()}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
        ))}
        {users.length > maxDisplay && (
          <div 
            className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground"
            title={`${users.length - maxDisplay} more users`}
          >
            +{users.length - maxDisplay}
          </div>
        )}
      </div>
      
      {/* Status text */}
      <div className="text-sm text-muted-foreground">
        {users.length === 0 ? (
          <span>Just you</span>
        ) : users.length === 1 ? (
          <span>1 other person editing</span>
        ) : (
          <span>{users.length} people editing</span>
        )}
      </div>

      {/* Collaborative cursors info */}
      {users.some(u => u.cursor) && (
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <Clock size={12} />
          <span>Live cursors active</span>
        </div>
      )}
    </div>
  );
};