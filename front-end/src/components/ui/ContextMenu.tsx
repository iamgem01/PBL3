import React, { useState, useEffect, useRef } from "react";
import { FileText, Search, X, Loader2, AlertCircle } from "lucide-react";
import { getAllNotes } from "../../services/noteService"; // Thêm import

export interface Note {
    id: string;
    title: string;
    content?: string;
    createdAt?: Date;
}

interface ContextMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectNote: (note: Note) => void;
    selectedNotes?: Note[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     onSelectNote,
                                                     selectedNotes = []
                                                 }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fetch notes from API when menu opens
    useEffect(() => {
        if (isOpen && notes.length === 0) {
            fetchNotes();
        }
    }, [isOpen]);

    const fetchNotes = async () => {
        setLoading(true);
        setError(null);
        try {
            // Sử dụng noteService thay vì fetch trực tiếp
            const data = await getAllNotes();
            setNotes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notes');
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const isNoteSelected = (noteId: string) => {
        return selectedNotes.some(note => note.id === noteId);
    };

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute bottom-full left-0 mb-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 flex flex-col"
        >
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Add context from notes</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                    <X size={16} className="text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span className="text-sm">Loading notes...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-red-500 py-8">
                        <AlertCircle className="mb-2" size={24} />
                        <span className="text-sm text-center px-4">{error}</span>
                        <button
                            onClick={fetchNotes}
                            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                        {searchQuery ? "No notes found" : "No notes available"}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredNotes.map((note) => {
                            const isSelected = isNoteSelected(note.id);
                            return (
                                <button
                                    key={note.id}
                                    onClick={() => onSelectNote(note)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                                        isSelected
                                            ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent"
                                    }`}
                                >
                                    <FileText
                                        size={18}
                                        className={`mt-0.5 flex-shrink-0 ${
                                            isSelected ? "text-blue-600" : "text-gray-400"
                                        }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium text-sm ${
                                            isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-800 dark:text-gray-100"
                                        }`}>
                                            {note.title}
                                        </div>
                                        {note.content && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                {note.content.substring(0, 100)}...
                                            </div>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <div className="flex-shrink-0 text-blue-600 text-xs font-medium">
                                            ✓
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {selectedNotes.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        {selectedNotes.length} note{selectedNotes.length > 1 ? "s" : ""} selected
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContextMenu;