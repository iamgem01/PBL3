import { memo, useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: { pos: number };
}

interface CursorOverlayProps {
  users: CollaborativeUser[];
  editor: Editor | null;
}

interface CursorPosition {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  visible: boolean;
}

export const CursorOverlay = memo(({ users, editor }: CursorOverlayProps) => {
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ✅ Generate vibrant colors cho cursor
  const getVibrantColor = (userId: string): string => {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Cyan
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#FECA57', // Yellow
      '#FF9FF3', // Pink
      '#54A0FF', // Light Blue
      '#5F27CD', // Purple
      '#00D2D3', // Turquoise
      '#FF6348', // Orange
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    if (!editor || !users.length) {
      setCursors([]);
      return;
    }

    const updateCursors = () => {
      const editorElement = editor.view.dom;
      const editorRect = editorElement.getBoundingClientRect();

      const newCursors: CursorPosition[] = users
        .filter(user => user.cursor && user.cursor.pos !== undefined)
        .map(user => {
          try {
            const pos = user.cursor!.pos;
            
            if (pos < 0 || pos > editor.state.doc.content.size) {
              return null;
            }

            const coords = editor.view.coordsAtPos(pos);
            const x = coords.left - editorRect.left;
            const y = coords.top - editorRect.top;

            // ✅ Sử dụng màu vibrant
            const vibrantColor = getVibrantColor(user.id);

            return {
              userId: user.id,
              name: user.name,
              color: vibrantColor,
              x,
              y,
              visible: true,
            };
          } catch (error) {
            console.error('Error calculating cursor position:', error);
            return null;
          }
        })
        .filter((cursor): cursor is CursorPosition => cursor !== null);

      setCursors(newCursors);
    };

    updateCursors();

    const handleUpdate = () => {
      updateCursors();
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [users, editor]);

  if (!cursors.length) return null;

  return (
    <div 
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ position: 'absolute' }}
    >
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-150 ease-out"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translateX(-1px)',
          }}
        >
          {/* ✅ Cursor line - Vibrant color với glow */}
          <div
            className="w-0.5 h-5"
            style={{
              backgroundColor: cursor.color,
              boxShadow: `0 0 10px ${cursor.color}, 0 0 5px ${cursor.color}, 0 0 2px ${cursor.color}`,
              animation: 'cursorBlink 1s ease-in-out infinite',
            }}
          />
          
          {/* ✅ User label - Solid background với text trắng */}
          <div
            className="absolute top-0 left-1 whitespace-nowrap text-[11px] font-semibold px-2 py-1 rounded shadow-lg pointer-events-auto"
            style={{
              backgroundColor: cursor.color,
              color: '#FFFFFF',
              transform: 'translateY(-100%)',
              marginTop: '-4px',
              boxShadow: `0 2px 8px rgba(0,0,0,0.25)`,
            }}
          >
            {cursor.name}
          </div>
          
          <style>{`
            @keyframes cursorBlink {
              0%, 49% { opacity: 1; }
              50%, 100% { opacity: 0.4; }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
});

CursorOverlay.displayName = 'CursorOverlay';