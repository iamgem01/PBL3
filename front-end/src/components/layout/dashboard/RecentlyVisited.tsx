import { useEffect, useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNotes } from "@/services";

interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isImportant?: boolean;
}

export default function RecentlyVisited() {
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const notesData = await getAllNotes();
                setNotes(notesData.slice(0, 10));
            } catch (err: any) {
                setError(err.message || "Failed to load notes");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const amount = 250;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -amount : amount,
                behavior: "smooth",
            });
        }
    };

    const getNoteIcon = (title: string, content: string) => {
        const lowerTitle = title.toLowerCase();
        const lowerContent = content.toLowerCase();
        
        if (lowerTitle.includes('travel') || lowerContent.includes('travel')) return '🧳';
        if (lowerTitle.includes('task') || lowerContent.includes('todo')) return '📋';
        if (lowerTitle.includes('project') || lowerContent.includes('brainstorm')) return '🧠';
        if (lowerTitle.includes('journal') || lowerContent.includes('note')) return '📓';
        return '💡';
    };

    const getDescription = (content: string) => {
        if (!content) return 'No content';
        return content.length > 50 ? content.substring(0, 50) + '...' : content;
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
            
            if (diffInHours < 1) return 'just now';
            if (diffInHours < 24) return `${diffInHours}h ago`;
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        } catch {
            return 'recently';
        }
    };

    return (
        <section className="relative flex flex-col font-inter mb-12">
            <h2 className="text-lg font-regular font-inter mb-6 text-muted-foreground flex items-center">
                <Clock className="w-5 h-5 text-muted-foreground mr-2" strokeWidth={1.5} />
                Recently Visited
            </h2>

            {isLoading && (
                <div className="flex justify-center py-8">
                    <div className="text-muted-foreground">Loading notes...</div>
                </div>
            )}

            {error && (
                <div className="flex justify-center py-8">
                    <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
                </div>
            )}

            {!isLoading && !error && notes.length === 0 && (
                <div className="flex justify-center py-8">
                    <div className="text-muted-foreground">No notes found</div>
                </div>
            )}

            {!isLoading && !error && notes.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-card shadow-md rounded-full p-2 hover:bg-muted z-30 transition-all hover:scale-110 border border-border"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>

                    <div className="mx-12">
                        <div
                            ref={scrollRef}
                            className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide scroll-smooth"
                        >
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => navigate(`/notes/${note.id}`)}
                                    className="min-w-[200px] max-w-[200px] bg-card border border-border rounded-xl overflow-hidden flex-shrink-0
                                       hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="relative h-32 bg-muted overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                                            {getNoteIcon(note.title, note.content)}
                                        </div>
                                        <div className="absolute top-2 left-2 text-2xl bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
                                            {getNoteIcon(note.title, note.content)}
                                        </div>
                                        {note.isImportant && (
                                            <div className="absolute top-2 right-2 text-sm bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 rounded-full px-2 py-1 font-semibold shadow-sm">
                                                ★
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                                            {note.title || 'Untitled Note'}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 min-h-[32px]">
                                            {getDescription(note.content)}
                                        </p>
                                        <p className="flex items-center text-[11px] text-muted-foreground">
                                            <Clock className="w-3 h-3 text-muted-foreground mr-1" strokeWidth={1.5} />
                                            {formatTime(note.updatedAt || note.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-card shadow-md rounded-full p-2 hover:bg-muted z-30 transition-all hover:scale-110 border border-border"
                    >
                        <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                </div>
            )}
        </section>
    );
}