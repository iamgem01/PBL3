import { useEffect, useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
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
        <section className="relative flex flex-col font-inter items-left mb-12">
            <h2 className="text-lg font-regular font-inter mb-4 text-muted-foreground flex justify-start items-center">
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
                <>
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-[5%] top-1/2 -translate-y-1/2 bg-card shadow-md rounded-full p-2 hover:bg-muted z-20 transition-all hover:scale-110 border border-border"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>

                    <div className="relative w-full max-w-[100%]">
                        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background via-background/70 to-transparent pointer-events-none z-10" />
                        <div
                            ref={scrollRef}
                            className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide scroll-smooth"
                        >
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => navigate(`/notes/${note.id}`)}
                                    className="min-w-[180px] bg-card border border-border rounded-xl p-3 flex-shrink-0
                                       hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="relative">
                                        <img
                                            src={`/images/note.jpg`}
                                            alt={note.title}
                                            className="w-full h-28 object-cover rounded-md"
                                        />
                                        <div className="absolute top-2 left-2 text-lg bg-card/80 backdrop-blur-sm rounded-md px-2 py-[2px] border border-border">
                                            {getNoteIcon(note.title, note.content)}
                                        </div>
                                        {note.isImportant && (
                                            <div className="absolute top-2 right-2 text-sm bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 rounded-full px-1.5 py-0.5 font-semibold">
                                                ★
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {note.title || 'Untitled Note'}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {getDescription(note.content)}
                                        </p>
                                        <p className="flex items-center text-[11px] text-muted-foreground mt-1">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground mr-1" strokeWidth={1} />
                                            {formatTime(note.updatedAt || note.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background via-background/70 to-transparent pointer-events-none z-10" />
                    </div>

                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-[5%] top-1/2 -translate-y-1/2 bg-card shadow-md rounded-full p-2 hover:bg-muted z-20 transition-all hover:scale-110 border border-border"
                    >
                        <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                </>
            )}
        </section>
    );
}