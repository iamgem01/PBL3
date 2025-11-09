import { Settings, Trash, LayoutPanelTop } from "lucide-react";
import { UserMenu } from "./userpopup";

interface SidebarFooterProps {
    collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
    const footerButtons = [
        { label: "Template", icon: <LayoutPanelTop size={16} /> },
        { label: "Settings", icon: <Settings size={16} /> },
        { label: "Trash", icon: <Trash size={16} /> },
    ];

    return (
        <div className="border-t border-gray-200 p-3 text-sm">
            <div className="space-y-1">
                {footerButtons.map((btn) => (
                    <button
                        key={btn.label}
                        className="flex items-center gap-2 w-full px-1 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                    >
                        {btn.icon}
                        <span className={`${collapsed ? "hidden" : "inline font-medium"}`}>{btn.label}</span>
                    </button>
                ))}
            </div>

            <div
                className={`mt-4 flex items-center gap-2 border-t pt-3 ${
                    collapsed ? "justify-center" : ""
                }`}>
                {/* Avatar + Popup User Menu */}
                <UserMenu collapsed={collapsed} />

                {!collapsed && (
                    <div>
                        <p className="text-sm font-medium text-gray-800">Admin</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                )}
            </div>
        </div>
    );
}
