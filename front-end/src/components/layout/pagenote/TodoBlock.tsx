import type { ToDoBlock } from "./types";

interface Props {
  block: ToDoBlock;
  onUpdate: (id: string, updated: Partial<ToDoBlock>) => void;
  onAddBlock?: (afterId: string) => void;
}

export default function TodoBlockComponent({ block, onUpdate, onAddBlock }: Props) {
  const toggleCheck = () => {
    onUpdate(block.id, { checked: !block.checked });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(block.id, { text: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onAddBlock) {
      e.preventDefault();
      onAddBlock(block.id);
    }
  };

  return (
    <div className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded transition">
      <input
        type="checkbox"
        checked={block.checked}
        onChange={toggleCheck}
        className="w-4 h-4 cursor-pointer"
      />
      <input
        type="text"
        value={block.text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 outline-none p-1 bg-transparent"
        placeholder="Todo..."
      />
    </div>
  );
}
