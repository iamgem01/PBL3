import { useState, useRef } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import { documentContent, documentsMeta } from "@/data/documentContent";
import DocumentModal from "@/components/layout/dashboard/DocumentMotal";

// Educational thumbnail images
const thumbnails = [
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop", // Markdown - laptop writing
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop", // Note-taking - desk notes
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop", // Second brain - library
];

export default function LearnSection() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    
    const scroll = (dir: "left" | "right") => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
        }
    };

    const selectedContent =
        selectedId && documentContent[selectedId as keyof typeof documentContent]
            ? documentContent[selectedId as keyof typeof documentContent]
            : null;

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner':
                return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800';
            case 'Intermediate':
                return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800';
            case 'Advanced':
                return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800';
        }
    };

    return (
        <section className="relative">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
                    <h2 className="text-lg font-semibold text-foreground">
                        Learn & Grow
                    </h2>
                </div>
                <button className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all">
                    Browse all →
                </button>
            </div>

            <div className="relative group">
                {documentsMeta.length > 2 && (
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
                    {documentsMeta.map((doc, index) => (
                        <div
                            key={doc.id}
                            onClick={() => setSelectedId(doc.id)}
                            className="group/card min-w-[340px] max-w-[340px] bg-card border border-border hover:border-purple-500/50 rounded-2xl overflow-hidden flex-shrink-0 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            {/* Thumbnail Image */}
                            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30">
                                <img
                                    src={thumbnails[index % thumbnails.length]}
                                    alt={doc.title}
                                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent && !parent.querySelector('.fallback-icon')) {
                                            const fallback = document.createElement('div');
                                            fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center';
                                            fallback.innerHTML = '<svg class="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                                            parent.appendChild(fallback);
                                        }
                                    }}
                                />
                                
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                                
                                {/* Badges on image */}
                                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(doc.difficulty)} shadow-sm backdrop-blur-sm`}>
                                        {doc.difficulty}
                                    </div>
                                    {index === 0 && (
                                        <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
                                            <Sparkles className="w-3 h-3" />
                                            New
                                        </div>
                                    )}
                                </div>

                                {/* Read time badge */}
                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full shadow-lg">
                                    <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs font-medium text-foreground">{doc.readTime}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 min-h-[48px] group-hover/card:bg-gradient-to-r group-hover/card:from-purple-600 group-hover/card:to-pink-600 group-hover/card:bg-clip-text group-hover/card:text-transparent transition-all">
                                    {doc.title}
                                </h3>
                                
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4">
                                    {doc.summary}
                                </p>
                                
                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                    <div className="flex flex-wrap gap-1.5">
                                        {doc.tags.slice(0, 2).map((tag, idx) => (
                                            <span 
                                                key={idx}
                                                className="text-xs px-2.5 py-1 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 rounded-full font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover/card:scale-110 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Document Modal */}
            <DocumentModal
                isOpen={!!selectedId}
                onClose={() => setSelectedId(null)}
                content={selectedContent}
            />
        </section>
    );
}