import type { ImageBlock } from "./types";

interface Props {
  block: ImageBlock;
}

export default function ImageBlockComponent({ block }: Props) {
  return (
    <div className="my-3">
      <img
        src={block.src}
        alt={block.alt || ""}
        className="rounded-lg shadow-md max-w-full"
      />
    </div>
  );
}
