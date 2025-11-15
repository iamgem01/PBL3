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
        <section className="relative mt-10 font-inter flex flex-col items-left">
            <h2 className="text-lg font-regular mb-4 text-muted-foreground flex items-center">
                <BookOpen className="w-5 h-5 text-muted-foreground mr-2" strokeWidth={1.5} />
                Quick Learn
            </h2>

            {/* Left button */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-[6%] top-1/2 -translate-y-1/2 bg-card shadow-md rounded-full p-2 hover:bg-muted z-20 transition-all hover:scale-110 border border-border"
            >
                <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            <div className="relative w-full flex justify-center">
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-3 scrollbar-hide scroll-smooth max-w-[85%]"
                >
                    {learnResources.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedId(item.id)}
                            className="min-w-[260px] bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            <div className="relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm text-[10px] font-medium text-foreground px-2 py-[2px] rounded-md border border-border">
                                    {item.readTime || "5 min read"}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{item.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right fade */}
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background via-background/70 to-transparent pointer-events-none z-10" />
            </div>
            
            {/* Right button */}
            <button 
                onClick={() => scroll("right")} 
                className="absolute right-[6%] top-1/2 -translate-y-1/2 bg-card shadow-md rounded-full p-2 hover:bg-muted z-20 transition-all hover:scale-110 border border-border"
            >
                <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
            
            {/* Document Modal */}
            <DocumentModal
                isOpen={!!selectedId}
                onClose={() => setSelectedId(null)}
                content={selectedContent}
            />
        </section>
    );
}