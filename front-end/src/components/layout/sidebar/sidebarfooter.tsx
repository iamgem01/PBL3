import { Settings, Trash, LayoutPanelTop } from "lucide-react";
import { UserMenu } from "./userpopup";

interface SidebarFooterProps {
    collapsed: boolean;
    onOpenTrashModal: () => void;
    onOpenSettingsModal: () => void;
}

export function SidebarFooter({ collapsed, onOpenTrashModal, onOpenSettingsModal }: SidebarFooterProps) {
    const footerButtons = [
        { label: "Template", icon: <LayoutPanelTop size={16} /> },
        { 
            label: "Settings", 
            icon: <Settings size={16} />, 
            onClick: onOpenSettingsModal
        },
        { 
            label: "Trash", 
            icon: <Trash size={16} />, 
            onClick: onOpenTrashModal
        },
    ];

    return (
        <div className="border-t border-border p-3 text-sm">
            <div className="space-y-1">
                {footerButtons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={btn.onClick}
                        className="flex items-center gap-2 w-full px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
                    >
                        {btn.icon}
                        <span className={`${collapsed ? "hidden" : "inline font-medium"}`}>{btn.label}</span>
                    </button>
                ))}
            </div>

            <div
                className={`mt-4 flex items-center gap-2 border-t border-border pt-3 ${
                    collapsed ? "justify-center" : ""
                }`}>
                {/* Avatar + Popup User Menu */}
                <UserMenu collapsed={collapsed} />

                {!collapsed && (
                    <div>
                        <p className="text-sm font-medium text-foreground">Admin</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                )}
            </div>
        </div>
    );
}