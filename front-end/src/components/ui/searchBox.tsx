import { useState, useEffect } from "react"; // Thêm useEffect import
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllNotes } from "@/services/noteService";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isImportant?: boolean;
}

interface SearchBoxProps {
  onClose: () => void;
}

export default function SearchBox({ onClose }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllNotes = async () => {
      try {
        const notes = await getAllNotes();
        setAllNotes(notes);
      } catch (err: any) {
        setError(err.message || "Failed to load notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllNotes();
  }, []);

  const results = allNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase())
  );

  // Hàm để lấy icon dựa trên title hoặc content
  const getNoteIcon = (title: string, content: string) => {
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();

    if (lowerTitle.includes("travel") || lowerContent.includes("travel"))
      return "🧳";
    if (lowerTitle.includes("task") || lowerContent.includes("todo"))
      return "📝";
    if (lowerTitle.includes("project") || lowerContent.includes("brainstorm"))
      return "🧠";
    if (lowerTitle.includes("journal") || lowerContent.includes("note"))
      return "📔";
    return "💡"; // Default icon
  };

  const getDescription = (content: string) => {
    if (!content) return "No content";

    // Thử parse JSON content nếu có
    try {
      const parsed = JSON.parse(content);
      if (
        parsed.sections &&
        Array.isArray(parsed.sections) &&
        parsed.sections.length > 0
      ) {
        return parsed.sections[0].title || "Structured content";
      }
      return content.length > 50 ? content.substring(0, 50) + "..." : content;
    } catch {
      // Plain text content
      return content.length > 50 ? content.substring(0, 50) + "..." : content;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return "just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch {
      return "recently";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose} // Đóng khi click ra ngoài
    >
      <div
        className="bg-white rounded-xl shadow-xl w-[500px] max-w-[90%] p-6 relative"
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện nổi bọt
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Search Notes
        </h2>

        <input
          type="text"
          placeholder="Type to search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          autoFocus // Tự động focus vào input
        />

        <div className="mt-4 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading notes...</span>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          ) : results.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-4">
              {query ? "No results found." : "Start typing to search notes..."}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map((note) => (
                <li
                  key={note.id}
                  className="p-3 hover:bg-indigo-50 rounded-lg cursor-pointer flex items-center gap-3"
                  onClick={() => {
                    onClose();
                    navigate(`/notes/${note.id}`);
                  }}
                >
                  <div className="w-10 h-10 rounded-md bg-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                    {getNoteIcon(note.title, note.content)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {note.title || "Untitled Note"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {getDescription(note.content)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Updated {formatTime(note.updatedAt || note.createdAt)}
                      {note.isImportant && " • ⭐ Important"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
