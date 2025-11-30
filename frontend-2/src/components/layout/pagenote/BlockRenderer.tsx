import TextBlockComponent from "./TextBlock";
import TodoBlockComponent from "./TodoBlock";
import CodeBlockComponent from "./CodeBlock";
import ImageBlockComponent from "./ImageBlock";
import type { Block } from "./types";

interface Props {
  block: Block;
  onUpdate: (id: string, updated: Partial<Block>) => void;
  onAddBlock: (afterId?: string, type?: Block["type"]) => void;
  onturnInto?: (id: string, type: Block["type"]) => void;
}

export default function BlockRenderer({ block, onUpdate, onAddBlock }: Props) {
  switch (block.type) {
    case "text":
      return <TextBlockComponent block={block} onUpdate={onUpdate} onAddBlock={onAddBlock} />;
    case "todo":
      return <TodoBlockComponent block={block} onUpdate={onUpdate} />;
    case "code":
      return <CodeBlockComponent block={block} onUpdate={onUpdate} />;
    case "image":
      return <ImageBlockComponent block={block} />;
    default:
      return null;
  }
}
