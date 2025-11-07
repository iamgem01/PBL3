import { Plus, MessageSquare, Settings } from "lucide-react";

export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
            <div className="p-4 font-bold text-xl text-gray-700 border-b border-gray-200">
                MyChatGPT
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-200 text-gray-700">
                    <Plus className="w-4 h-4" /> New Chat
                </button>

                <div className="mt-4 space-y-1">
                    <p className="text-xs text-gray-400 mb-1">Recent</p>
                    {[1, 2, 3].map(i => (
                        <button
                            key={i}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-200 text-gray-600 text-sm"
                        >
                            <MessageSquare className="w-4 h-4" /> Chat session {i}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-3 border-t border-gray-200">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-200 text-gray-700">
                    <Settings className="w-4 h-4" /> Settings
                </button>
            </div>
        </div>
    );
}
