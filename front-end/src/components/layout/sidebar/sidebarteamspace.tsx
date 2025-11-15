import { useEffect, useState } from "react";
import { BookOpen, Sparkles, FileText } from "lucide-react";
import { FaJava } from "react-icons/fa";
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

interface SidebarTeamspaceProps {
    collapsed: boolean;
}

export default function SidebarTeamspace({ collapsed }: SidebarTeamspaceProps) {
    const navigate = useNavigate();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const notesData = await getAllNotes();
                setNotes(notesData);
            } catch (err: any) {
                console.error("Failed to fetch notes:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, []);

    const teamspaces = [
        { label: "PBL 3 - Aeternus", icon: <BookOpen size={14} /> },
        { label: "AeternusAI", icon: <Sparkles size={14} /> },
        { label: "Session 1", icon: <FaJava size={14} /> },
    ];

    const truncateTitle = (title: string, maxLength: number = 20) => {
        if (!title) return "Untitled";
        return title.length > maxLength ? title.substring(0, maxLength) + "..." : title;
    };

    const getNoteIcon = (title: string, content: string) => {
        const lowerTitle = title?.toLowerCase() || "";
        const lowerContent = content?.toLowerCase() || "";
        
        if (lowerTitle.includes('task') || lowerContent.includes('todo')) return '📋';
        if (lowerTitle.includes('journal') || lowerContent.includes('note')) return '📓';
        if (lowerTitle.includes('project') || lowerContent.includes('brainstorm')) return '🧠';
        if (lowerTitle.includes('travel') || lowerContent.includes('trip')) return '🧳';
        return '📄';
    };

    return (
        <div className="border-t border-border p-3 text-sm">
            {!collapsed && (
                <h3 className="text-xs text-muted-foreground mb-1 font-semibold tracking-wide">
                    Teamspace
                </h3>
            )}
            <div className="space-y-1">
                {teamspaces.map((btn) => (
                    <button
                        key={btn.label}
                        className={`flex items-center ${
                            collapsed ? "justify-center" : "gap-1"
                        } w-full px-1 py-1 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors`}
                    >
                        {btn.icon}
                        {!collapsed && <span className="font-normal text-sm">{btn.label}</span>}
                    </button>
                ))}
            </div>

            {!collapsed && (
                <h3 className="text-xs text-muted-foreground mb-1 p-1 font-semibold tracking-wide mt-4">
                    All Notes
                </h3>
            )}
            <div className="space-y-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                ) : notes.length > 0 ? (
                    notes.map((note) => (
                        <button
                            key={note.id}
                            onClick={() => navigate(`/notes/${note.id}`)}
                            className={`flex items-center ${
                                collapsed ? "justify-center" : "gap-1"
                            } w-full px-1 py-1 text-foreground hover:bg-muted rounded-lg transition-colors`}
                        >
                            <span className="text-sm">{getNoteIcon(note.title, note.content)}</span>
                            {!collapsed && (
                                <span className="font-normal text-xs truncate">
                                    {truncateTitle(note.title)}
                                </span>
                            )}
                        </button>
                    ))
                ) : (
                    <div className="text-xs text-muted-foreground text-center py-2">
                        {!collapsed ? "No notes yet" : "📝"}
                    </div>
                )}
            </div>
        </div>
    );
}