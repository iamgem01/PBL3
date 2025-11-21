import { useState, useRef } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { learnResources } from "@/services/mockData";
import { documentContent } from "@/data/documentContent";
import DocumentModal from "@/components/layout/dashboard/DocumentMotal";

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

    return (
        <section className="relative mt-10 font-inter flex flex-col">
            <h2 className="text-lg font-regular mb-6 text-muted-foreground flex items-center">
                <BookOpen className="w-5 h-5 text-muted-foreground mr-2" strokeWidth={1.5} />
                Quick Learn
            </h2>

            <div className="relative">
                {/* Left button */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-card shadow-md rounded-full p-2 hover:bg-muted z-30 transition-all hover:scale-110 border border-border"
                >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>

                <div className="mx-12">
                    <div
                        ref={scrollRef}
                        className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide scroll-smooth"
                    >
                        {learnResources.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                                className="min-w-[280px] max-w-[280px] bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex-shrink-0"
                            >
                                <div className="relative h-40 overflow-hidden bg-muted">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.parentElement!.innerHTML += '<div class="absolute inset-0 flex items-center justify-center text-4xl opacity-30">📚</div>';
                                        }}
                                    />
                                    <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground px-2 py-1 rounded-md border border-border shadow-sm">
                                        {item.readTime || "5 min read"}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right button */}
                <button 
                    onClick={() => scroll("right")} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-card shadow-md rounded-full p-2 hover:bg-muted z-30 transition-all hover:scale-110 border border-border"
                >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
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