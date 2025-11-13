import { useRef } from "react";
import type { TextBlock } from "./types";

interface Props {
  block: TextBlock;
  onUpdate: (id: string, updated: Partial<TextBlock>) => void;
  onAddBlock: (afterId?: string) => void;
}

export default function TextBlockComponent({ block, onUpdate, onAddBlock }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handleInput = () => {
    if (ref.current) {
      onUpdate(block.id, { text: ref.current.innerText });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAddBlock(block.id);
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className="outline-none p-1 min-h-[24px] hover:bg-gray-50 transition rounded"
      style={{
        fontWeight: block.annotations?.bold ? "bold" : "normal",
        fontStyle: block.annotations?.italic ? "italic" : "normal",
        textDecoration: `${block.annotations?.underline ? "underline " : ""}${block.annotations?.strikethrough ? "line-through" : ""}`,
        fontFamily: block.annotations?.code ? "monospace" : "inherit",
        backgroundColor: block.annotations?.code ? "#f3f4f6" : "transparent",
        borderRadius: block.annotations?.code ? 4 : 0
      }}
    >
      {block.text}
    </div>
  );
}
