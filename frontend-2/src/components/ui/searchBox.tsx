import { useState, useEffect } from "react"; // Thêm useEffect import
import { X, Star } from "lucide-react";
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
  const [filterImportant, setFilterImportant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllNotes = async () => {
      try {
        const notes = await getAllNotes();
        // Chuẩn hóa dữ liệu để đảm bảo trường isImportant luôn đúng
        const normalizedNotes = notes.map((note: any) => ({
          ...note,
          isImportant: note.isImportant ?? note.is_important ?? false,
          createdAt: note.createdAt || note.created_at || new Date().toISOString(),
          updatedAt: note.updatedAt || note.updated_at || new Date().toISOString(),
        }));
        setAllNotes(normalizedNotes);
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
      (note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase())) &&
      (!filterImportant || note.isImportant)
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
    if (!dateString) return "recently";
    try {
      // Đảm bảo xử lý đúng giờ UTC nếu chuỗi thiếu ký tự timezone
      const dateValue = !dateString.endsWith("Z") && !/[+-]\d{2}:\d{2}/.test(dateString)
        ? `${dateString}Z`
        : dateString;

      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "recently";

      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return "recently";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      // Hiển thị ngày giờ theo GMT+7 (Vietnam)
      return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
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

        <div className="relative">
          <input
            type="text"
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 pr-10 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            autoFocus // Tự động focus vào input
          />
          <button
            onClick={() => setFilterImportant(!filterImportant)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
              filterImportant ? "bg-yellow-100 text-yellow-500" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
            title="Filter by Important"
          >
            <Star size={16} fill={filterImportant ? "currentColor" : "none"} />
          </button>
        </div>

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
