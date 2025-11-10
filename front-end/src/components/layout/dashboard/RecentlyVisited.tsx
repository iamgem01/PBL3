import { recentlyVisited } from "@/services/mockData";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function RecentlyVisited() {
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const amount = 250; // nhỏ hơn để cuộn từng card
            scrollRef.current.scrollBy({
                left: direction === "left" ? -amount : amount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="relative flex flex-col font-inter items-left mb-12">
            <h2 className="text-lg font-regular font-inter mb-4 text-gray-500 flex justify-start items-center">
                <Clock className="w-5 h-5 text-gray-500 mr-2" strokeWidth={1.5} />
                Recently Visited
            </h2>

            <button
                onClick={() => scroll("left")}
                className="absolute left-[5%] top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-2 hover:bg-gray-100 z-20 transition-transform hover:scale-110"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="relative w-full max-w-[100%]">
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 via-gray-50/70 to-transparent pointer-events-none z-10" />
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide scroll-smooth"
                >
                    {recentlyVisited.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/note/${item.id}`)}
                            className="min-w-[180px] bg-white border border-gray-100 rounded-xl p-3 flex-shrink-0
                                       hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            <div className="relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-28 object-cover rounded-md"
                                />
                                <div className="absolute top-2 left-2 text-lg bg-white/70 backdrop-blur-sm rounded-md px-2 py-[2px]">
                                    {item.icon}
                                </div>
                            </div>

                            <div className="mt-2">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                    {item.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{item.description}</p>
                                <p className="flex items-center text-[11px] text-gray-400 mt-1">
                                    <Clock className="w-3.5 h-3.5 text-gray-400 mr-1" strokeWidth={1} />
                                    {item.time || "just now"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 via-gray-50/70 to-transparent pointer-events-none z-10" />
            </div>

            <button
                onClick={() => scroll("right")}
                className="absolute right-[5%] top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-2 hover:bg-gray-100 z-20 transition-transform hover:scale-110"
            >
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
        </section>
    );
}
