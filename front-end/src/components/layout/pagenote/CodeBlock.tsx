import type { CodeBlock } from "./types";

interface Props {
  block: CodeBlock;
  onUpdate: (id: string, updated: Partial<CodeBlock>) => void;
}

export default function CodeBlockComponent({ block, onUpdate }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(block.id, { code: e.target.value });
  };

  return (
    <textarea
      value={block.code}
      onChange={handleChange}
      className="w-full p-2 font-mono text-sm bg-gray-100 rounded-md outline-none resize-none hover:bg-gray-200 transition"
      rows={Math.max(3, block.code.split("\n").length)}
      placeholder="Write your code..."
    />
  );
}
