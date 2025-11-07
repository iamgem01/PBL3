import { useState } from "react";
import { Search, Trash2, ChevronDown, X } from "lucide-react";

interface TrashModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TrashModal({ isOpen, onClose }: TrashModalProps) {
    const [query, setQuery] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 p-5">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Thanh tìm kiếm */}
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 px-3 py-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search pages in Trash"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                    />
                </div>

                {/* Filter bar */}
                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 hover:text-gray-700 transition">
                            Last edited by <ChevronDown className="w-3 h-3" />
                        </button>
                        <button className="flex items-center gap-1 hover:text-gray-700 transition">
                            In <ChevronDown className="w-3 h-3" />
                        </button>
                        <button className="flex items-center gap-1 hover:text-gray-700 transition">
                            Teamspaces <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Empty state */}
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Trash2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No results</p>
                </div>

                {/* Footer */}
                <div className="text-xs text-gray-400 text-center border-t pt-3">
                    Pages in Trash for over 30 days will be automatically deleted
                </div>
            </div>
        </div>
    );
}
