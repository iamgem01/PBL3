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
            <h2 className="text-lg font-regular mb-4 text-gray-500 flex items-center">
                <BookOpen className="w-5 h-5 text-gray-500 mr-2" strokeWidth={1.5} />
                Quick Learn
            </h2>

            {/* Nút trái */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-[6%] top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-2 hover:bg-gray-100 z-20 transition-transform hover:scale-110"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="relative w-full flex justify-center">
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-3 scrollbar-hide scroll-smooth max-w-[85%]"
                >
                    {learnResources.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedId(item.id)} // Mở modal
                            className="min-w-[260px] bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            <div className="relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="absolute bottom-2 left-2 bg-white/70 backdrop-blur-sm text-[10px] font-medium text-gray-700 px-2 py-[2px] rounded-md">
                                    {item.readTime || "5 min read"}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">{item.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

            {/* Fade phải */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 via-gray-50/70 to-transparent pointer-events-none z-10" />
            </div>
            {/* Nút phải */}
            <button onClick={() => scroll("right")} className="absolute right-[6%] top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-2 hover:bg-gray-100 z-20 transition-transform hover:scale-110" >
                <ChevronRight className="w-5 h-5 text-gray-600" /> </button>
            {/* Popup hiển thị document */}
            <DocumentModal
                isOpen={!!selectedId}
                onClose={() => setSelectedId(null)}
                content={selectedContent}
            />
        </section>
    );
}
