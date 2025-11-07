import { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { recentlyVisited } from "@/services/mockData";

interface SearchBoxProps {
    onClose: () => void;
}

export default function SearchBox({ onClose }: SearchBoxProps) {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const results = recentlyVisited.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[500px] max-w-[90%] p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-gray-800">Search Notes</h2>

                <input
                    type="text"
                    placeholder="Type to search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />

                <div className="mt-4 max-h-60 overflow-y-auto">
                    {results.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center mt-4">No results found.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {results.map((item) => (
                                <li
                                    key={item.id}
                                    className="p-3 hover:bg-indigo-50 rounded-lg cursor-pointer flex items-center gap-3"
                                    onClick={() => {
                                        onClose();
                                        navigate(`/note/${item.id}`); // chuyển hướng tới trang note
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-10 h-10 rounded-md object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-800">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
