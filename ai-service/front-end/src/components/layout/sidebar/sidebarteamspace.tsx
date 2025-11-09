import { BookOpen, Sparkles } from "lucide-react";
import { FaJava } from "react-icons/fa";
import { FcStart, FcIdea, FcList, FcBookmark, FcPlanner } from "react-icons/fc";

interface SidebarTeamspaceProps {
    collapsed: boolean;
}

export default function SidebarTeamspace({ collapsed }: SidebarTeamspaceProps) {
    const teamspaces = [
        { label: "PBL 3 - Aeternus", icon: <BookOpen size={14} /> },
        { label: "AeternusAI", icon: <Sparkles size={14} /> },
        { label: "Session 1", icon: <FaJava size={14} /> },
    ];

    const privates = [
        { label: "Getting Started", icon: <FcStart size={14} /> },
        { label: "Quick Note", icon: <FcIdea size={14} /> },
        { label: "Task List", icon: <FcList size={14} /> },
        { label: "Journal", icon: <FcBookmark size={14} /> },
        { label: "Project Planner", icon: <FcPlanner size={14} /> },
    ];

    return (
        <div className="border-t p-3 text-sm">
            {!collapsed && (
                <h3 className="text-xs text-gray-600 mb-1 font-semibold tracking-wide">
                    Teamspace
                </h3>
            )}
            <div className="space-y-1">
                {teamspaces.map((btn) => (
                  <button
                  key={btn.label}
                  className={`flex items-center w-full px-2 py-1 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors ${
                    collapsed ? "justify-center" : "gap-2"
                  }`}
                >
                  <div className="flex-shrink-0 flex items-center justify-center">{btn.icon}</div>
                  {!collapsed && <span className="font-normal text-sm">{btn.label}</span>}
                </button>
                ))}
            </div>

            {!collapsed && (
                <h3 className="text-xs text-gray-600 mb-1 p-1 font-semibold tracking-wide">
                    Private
                </h3>
            )}
            <div className="space-y-1">
                {privates.map((btn) => (
                    <button
                        key={btn.label}
                        className={`flex items-center ${
                            collapsed ? "justify-center" : "gap-1"
                        } w-full px-1 py-1 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors`}
                    >
                        {btn.icon}
                        {!collapsed && <span className="font-normal text-xs">{btn.label}</span>}
                    </button>
                ))}
            </div>
        </div>


    );
}
