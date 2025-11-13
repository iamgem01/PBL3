import { FileText, Share2, User, Globe, MoreHorizontal } from "lucide-react";
import { useRef, useEffect } from "react";

interface NoteHeaderProps {
  noteName: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onChange: (value: string) => void;
}

export default function NoteHeader({ noteName, isEditing, onToggleEdit, onChange }: NoteHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-gray-600" />
        {isEditing ? (
          <input
            ref={inputRef}
            value={noteName}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onToggleEdit}
            className="text-gray-600 bg-transparent border-b border-blue-500 outline-none px-1"
          />
        ) : (
          <span
            className="text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
            onClick={onToggleEdit}
          >
            {noteName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center gap-1">
          <Globe className="w-3 h-3" />
          Private
        </span>
        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </button>
        <button className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center">
          <MoreHorizontal className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
