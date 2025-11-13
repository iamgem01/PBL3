import React, { useState, useEffect, useRef } from "react";
import { FileText, Search, X } from "lucide-react";

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


const mockNotes: Note[] = [
    { id: "1", title: "Getting Started with React", content: "React is a JavaScript library..." },
    { id: "2", title: "TypeScript Basics", content: "TypeScript adds static typing..." },
    { id: "3", title: "Node.js Tutorial", content: "Node.js is a runtime environment..." },
    { id: "4", title: "Database Design", content: "Database design principles..." },
    { id: "5", title: "API Development", content: "RESTful API best practices..." },
];

const ContextMenu: React.FC<ContextMenuProps> = ({ 
    isOpen, 
    onClose, 
    onSelectNote,
    selectedNotes = [] 
}) => {
    const [notes] = useState<Note[]>(mockNotes);
    const [searchQuery, setSearchQuery] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

   

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
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isNoteSelected = (noteId: string) => {
        return selectedNotes.some(note => note.id === noteId);
    };

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 flex flex-col"
        >
            {/* Header */}
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Add context from notes</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200">
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
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                </div>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto p-2">
                {filteredNotes.length === 0 ? (
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
                                            ? "bg-blue-50 border border-blue-200"
                                            : "hover:bg-gray-50 border border-transparent"
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
                                            isSelected ? "text-blue-900" : "text-gray-800"
                                        }`}>
                                            {note.title}
                                        </div>
                                        {note.content && (
                                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {note.content}
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
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-600">
                        {selectedNotes.length} note{selectedNotes.length > 1 ? "s" : ""} selected
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContextMenu;

