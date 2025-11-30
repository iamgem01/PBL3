import React from "react";
import { Bold, Italic, Underline, Code, Link, Type, Palette } from "lucide-react";
import type { Annotation } from "./types";

const ICONS: Record<keyof Annotation, React.ElementType> = {
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strikethrough: Code, // ví dụ dùng Code cho strikethrough, đổi theo ý bạn
  code: Type,          // ví dụ dùng Type icon cho code
  color: Palette,
  link: Link,
};

interface Props {
  show: boolean;
  x: number;
  y: number;
  onAction?: (action: keyof Annotation) => void;
}

export default function SelectionToolbar({ show, x, y, onAction }: Props) {
  if (show === false) return null; // ẩn toolbar nếu show=false

  return (
    <div
      className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-2xl px-2 py-1.5 flex items-center gap-1"
      style={{
        left: x,
        top: y,
        transform: "translateX(-50%)",
      }}
    >
      {Object.entries(ICONS).map(([name, Icon]) => (
        <button
          key={name}
          className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors"
          onClick={() => onAction?.(name as keyof Annotation)}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
