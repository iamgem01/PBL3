import { memo } from 'react';

interface TypingUser {
  id: string;
  name: string;
  email: string;
  color: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export const TypingIndicator = memo(({ typingUsers }: TypingIndicatorProps) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  // Lấy unique users (tránh duplicate)
  const uniqueUsers = Array.from(
    new Map(typingUsers.map(user => [user.id, user])).values()
  );

  const getTypingText = () => {
    if (uniqueUsers.length === 1) {
      return `${uniqueUsers[0].name} is typing...`;
    } else if (uniqueUsers.length === 2) {
      return `${uniqueUsers[0].name} and ${uniqueUsers[1].name} are typing...`;
    } else {
      return `${uniqueUsers[0].name} and ${uniqueUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
      {/* Typing animation dots */}
      <div className="flex items-center gap-1">
        {uniqueUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: user.color,
              animationDelay: `${index * 0.15}s`,
            }}
          />
        ))}
      </div>
      
      {/* Typing text */}
      <span className="italic">{getTypingText()}</span>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';