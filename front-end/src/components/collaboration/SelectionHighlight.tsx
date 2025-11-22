import { memo, useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';

interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  color: string;
  selection?: { from: number; to: number };
}

interface SelectionHighlightProps {
  users: CollaborativeUser[];
  editor: Editor | null;
}

interface HighlightRect {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const SelectionHighlight = memo(({ users, editor }: SelectionHighlightProps) => {
  const [highlights, setHighlights] = useState<HighlightRect[]>([]);

  useEffect(() => {
    if (!editor || !users.length) {
      setHighlights([]);
      return;
    }

    const updateHighlights = () => {
      const editorElement = editor.view.dom;
      const editorRect = editorElement.getBoundingClientRect();

      const newHighlights: HighlightRect[] = [];

      users.forEach(user => {
        if (!user.selection || user.selection.from === user.selection.to) {
          return; // Không có selection hoặc selection rỗng
        }

        try {
          const { from, to } = user.selection;
          
          // Đảm bảo positions hợp lệ
          if (from < 0 || to > editor.state.doc.content.size || from >= to) {
            return;
          }

          // Lấy tọa độ của selection
          const fromCoords = editor.view.coordsAtPos(from);
          const toCoords = editor.view.coordsAtPos(to);

          // Tính toán vị trí relative
          const x = fromCoords.left - editorRect.left;
          const y = fromCoords.top - editorRect.top;
          const width = toCoords.right - fromCoords.left;
          const height = toCoords.bottom - fromCoords.top;

          // Xử lý multi-line selection (đơn giản hóa - chỉ highlight first line)
          if (height > 30) {
            // Multi-line: highlight toàn bộ chiều rộng của dòng đầu
            newHighlights.push({
              userId: user.id,
              name: user.name,
              color: user.color,
              x,
              y,
              width: editorRect.width - x,
              height: 24, // Height của một dòng
            });
          } else {
            // Single line
            newHighlights.push({
              userId: user.id,
              name: user.name,
              color: user.color,
              x,
              y,
              width,
              height: 24,
            });
          }
        } catch (error) {
          console.error('Error calculating selection highlight:', error);
        }
      });

      setHighlights(newHighlights);
    };

    // Update khi có thay đổi
    updateHighlights();

    const handleUpdate = () => {
      updateHighlights();
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [users, editor]);

  if (!highlights.length) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-[5]"
      style={{ position: 'absolute' }}
    >
      {highlights.map((highlight, index) => (
        <div
          key={`${highlight.userId}-${index}`}
          className="absolute transition-all duration-150 ease-out rounded-sm"
          style={{
            left: `${highlight.x}px`,
            top: `${highlight.y}px`,
            width: `${highlight.width}px`,
            height: `${highlight.height}px`,
            backgroundColor: highlight.color,
            opacity: 0.2,
            border: `1px solid ${highlight.color}`,
            borderColor: `${highlight.color}66`,
          }}
          title={`${highlight.name}'s selection`}
        />
      ))}
    </div>
  );
});

SelectionHighlight.displayName = 'SelectionHighlight';