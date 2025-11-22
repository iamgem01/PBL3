import { memo } from 'react';
import { User } from 'lucide-react';

interface PresenceUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: { pos: number };
  selection?: { from: number; to: number };
}

interface PresenceIndicatorProps {
  users: PresenceUser[];
}

export const PresenceIndicator = memo(({ users }: PresenceIndicatorProps) => {
  if (!users || users.length === 0) {
    return null;
  }

  // ✅ Đảm bảo không có duplicate users
  const uniqueUsers = Array.from(
    new Map(users.map(user => [user.id, user])).values()
  );

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User size={14} />
        <span>Active collaborators:</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {uniqueUsers.map((user) => (
          <div
            key={`${user.id}-${user.email}`}
            className="flex items-center gap-2 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs transition-all hover:scale-105"
            title={`${user.name} (${user.email})`}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: user.color }}
            />
            <span className="font-medium">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

PresenceIndicator.displayName = 'PresenceIndicator';