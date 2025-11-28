import { memo, useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import { useRef } from "react";

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

export const SelectionHighlight = memo(
  ({ users, editor }: SelectionHighlightProps) => {
    const [highlights, setHighlights] = useState<HighlightRect[]>([]);
    const updateTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
      if (!editor || !users.length) {
        setHighlights([]);
        return;
      }

      const updateHighlights = () => {
        try {
          const editorElement = editor.view.dom;
          const editorRect = editorElement.getBoundingClientRect();

          const newHighlights: HighlightRect[] = [];

          users.forEach((user) => {
            try {
              // ✅ FIXED: Validate user data cực kỹ
              if (!user || !user.id || !user.selection) {
                return;
              }

              const { from, to } = user.selection;

              // ✅ FIXED: Better position validation
              if (
                from === undefined ||
                to === undefined ||
                from < 0 ||
                to > editor.state.doc.content.size ||
                from >= to
              ) {
                return;
              }

              // Lấy tọa độ của selection
              const fromCoords = editor.view.coordsAtPos(from);
              const toCoords = editor.view.coordsAtPos(to);

              // Validate coordinates
              if (!fromCoords || !toCoords) {
                return;
              }

              // Tính toán vị trí relative
              const x = fromCoords.left - editorRect.left;
              const y = fromCoords.top - editorRect.top;
              const width = toCoords.right - fromCoords.left;
              const height = toCoords.bottom - fromCoords.top;

              // Validate final dimensions
              if (x < 0 || y < 0 || width <= 0 || height <= 0) {
                return;
              }

              // Xử lý multi-line selection (đơn giản hóa - chỉ highlight first line)
              if (height > 30) {
                // Multi-line: highlight toàn bộ chiều rộng của dòng đầu
                newHighlights.push({
                  userId: user.id,
                  name: user.name || "Unknown",
                  color: user.color || "#FF6B6B",
                  x,
                  y,
                  width: Math.min(editorRect.width - x, editorRect.width),
                  height: 24, // Height của một dòng
                });
              } else {
                // Single line
                newHighlights.push({
                  userId: user.id,
                  name: user.name || "Unknown",
                  color: user.color || "#FF6B6B",
                  x,
                  y,
                  width: Math.min(width, editorRect.width - x),
                  height: 24,
                });
              }
            } catch (error) {
              console.error(
                "❌ Error calculating selection highlight for user:",
                user.id,
                error
              );
            }
          });

          setHighlights(newHighlights);
        } catch (error) {
          console.error("❌ Error updating selection highlights:", error);
          setHighlights([]);
        }
      };

      // Debounce highlight updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(updateHighlights, 50);

      const handleUpdate = () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        updateTimeoutRef.current = setTimeout(updateHighlights, 50);
      };

      editor.on("update", handleUpdate);
      editor.on("selectionUpdate", handleUpdate);

      return () => {
        editor.off("update", handleUpdate);
        editor.off("selectionUpdate", handleUpdate);
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }, [users, editor]);

    if (!highlights.length) return null;

    return (
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{ position: "absolute" }}
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
  }
);

SelectionHighlight.displayName = "SelectionHighlight";
