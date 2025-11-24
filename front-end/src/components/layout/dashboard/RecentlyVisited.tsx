import { useEffect, useState, useRef } from "react";
import { Clock, ChevronLeft, ChevronRight, FileText, Star, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllNotes } from "@/services/noteService";

interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isImportant?: boolean;
    coverImage?: string;
}

const gradientPatterns = [
    "from-blue-400 via-blue-500 to-blue-600",
    "from-purple-400 via-purple-500 to-purple-600",
    "from-pink-400 via-pink-500 to-pink-600",
    "from-indigo-400 via-indigo-500 to-indigo-600",
    "from-violet-400 via-violet-500 to-violet-600",
    "from-fuchsia-400 via-fuchsia-500 to-fuchsia-600",
];

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
            scrollRef.current.scrollBy({
                left: direction === "left" ? -300 : 300,
                behavior: "smooth",
            });
        }
    };

    const getGradient = (index: number) => {
        return gradientPatterns[index % gradientPatterns.length];
    };

    const getDescription = (content: string) => {
        if (!content) return 'Empty document';
        const cleanContent = content.replace(/<[^>]*>/g, '').trim();
        return cleanContent.length > 80 ? cleanContent.substring(0, 80) + '...' : cleanContent;
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
            
            if (diffInHours < 1) return 'Just now';
            if (diffInHours < 24) return `${diffInHours}h ago`;
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays === 1) return 'Yesterday';
            if (diffInDays < 7) return `${diffInDays} days ago`;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return 'Recently';
        }
    };

    return (
        <section className="relative">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                    <h2 className="text-lg font-semibold text-foreground">
                        Recently Visited
                    </h2>
                </div>
                {notes.length > 0 && (
                    <button 
                        onClick={() => navigate('/notes')}
                        className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                        View all →
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-900 rounded-full" />
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" />
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {!isLoading && !error && notes.length === 0 && (
                <div className="relative bg-card border-2 border-dashed border-border rounded-2xl py-16 text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl from-purple-500/5 to-transparent rounded-full -ml-16 -mb-16" />
                    <div className="relative">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 mb-4">
                            <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-2">No documents yet</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                            Create your first document to start organizing your ideas
                        </p>
                        <button
                            onClick={() => navigate('/notes/new')}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            Create document
                        </button>
                    </div>
                </div>
            )}

            {!isLoading && !error && notes.length > 0 && (
                <div className="relative group">
                    {notes.length > 3 && (
                        <>
                            <button
                                onClick={() => scroll("left")}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 bg-white dark:bg-gray-900 border border-border shadow-xl rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 z-10 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scroll("right")}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 bg-white dark:bg-gray-900 border border-border shadow-xl rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 z-10 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
                    >
                        {notes.map((note, index) => (
                            <div
                                key={note.id}
                                onClick={() => navigate(`/notes/${note.id}`)}
                                className="group/card min-w-[280px] max-w-[280px] bg-card border border-border hover:border-purple-500/50 rounded-2xl overflow-hidden flex-shrink-0 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                {/* Cover Image / Gradient */}
                                <div className={`relative h-32 bg-gradient-to-br ${getGradient(index)} overflow-hidden`}>
                                    {note.coverImage ? (
                                        <img 
                                            src={note.coverImage} 
                                            alt={note.title}
                                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FileText className="w-12 h-12 text-white/80 group-hover/card:scale-110 transition-transform" />
                                        </div>
                                    )}
                                    
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    
                                    {/* Important Badge */}
                                    {note.isImportant && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full shadow-lg">
                                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover/card:bg-gradient-to-r group-hover/card:from-blue-600 group-hover/card:to-purple-600 group-hover/card:bg-clip-text group-hover/card:text-transparent transition-all">
                                        {note.title || 'Untitled'}
                                    </h3>
                                    
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                                        {getDescription(note.content)}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{formatTime(note.updatedAt || note.createdAt)}</span>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}