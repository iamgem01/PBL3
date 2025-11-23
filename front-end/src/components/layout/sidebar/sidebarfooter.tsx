// src/components/layout/sidebar/sidebarfooter.tsx
import { Settings, Trash, LayoutPanelTop } from "lucide-react";
import { UserMenu } from "./userpopup";
import { useNavigate } from "react-router-dom";

interface SidebarFooterProps {
    collapsed: boolean;
    onOpenTrashModal: () => void;
    onOpenSettingsModal: () => void;
}

export function SidebarFooter({ collapsed, onOpenTrashModal, onOpenSettingsModal }: SidebarFooterProps) {
    const navigate = useNavigate();

    const footerButtons = [
        { 
            label: "Template", 
            icon: <LayoutPanelTop size={16} />,
            onClick: () => navigate('/template')
        },
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
            {/* Footer Buttons */}
            <div className="space-y-1">
                {footerButtons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={btn.onClick}
                        className="flex items-center gap-2 w-full px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
                    >
                        {btn.icon}
                        <span className={`${collapsed ? "hidden" : "inline font-medium"}`}>
                            {btn.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* User Menu - Avatar + User Info */}
            <div className="mt-4 border-t border-border pt-3">
                <UserMenu collapsed={collapsed} />
            </div>
        </div>
    );
}