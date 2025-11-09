import { Home, Sparkles, Bell, Search } from "lucide-react";
interface SidebarMainButtonsProps {
    collapsed: boolean; //
}
export default function SidebarMainButtons({collapsed}: SidebarMainButtonsProps) {
    const buttons = [
        { label: "Home", icon: <Home size={16} /> },
        { label: "Aeternus AI", icon: <Sparkles size={16} /> },
        { label: "Notification", icon: <Bell size={16} /> },
        { label: "Search", icon: <Search size={16} /> },
    ];

    return (
        <div className="border-t border-gray-200 p-3 text-sm">
            <div className="space-y-1">
                {buttons.map((btn) => (
                    <button
                        key={btn.label}
                        className="flex items-center gap-2 w-full px-1 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                    >
                        {btn.icon}
                        <span className={`${collapsed ? "hidden" : "inline font-medium"}`}>{btn.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
