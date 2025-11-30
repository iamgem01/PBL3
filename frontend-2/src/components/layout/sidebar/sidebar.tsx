import type { Dispatch, SetStateAction } from "react";
import SidebarMainButtons from "./sidebarfeatures";
import SidebarTeamspace from "./sidebarteamspace";
import { SidebarFooter } from "./sidebarfooter";
import { Menu, FilePlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TrashModal from "@/components/ui/Trash/TrashModal";
import SettingsModal from "@/components/ui/Settings/SettingModal";

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const navigate = useNavigate();

    const openTrashModal = () => setIsTrashModalOpen(true);
    const closeTrashModal = () => setIsTrashModalOpen(false);

    const openSettingsModal = () => setIsSettingsModalOpen(true);
    const closeSettingsModal = () => setIsSettingsModalOpen(false);

    const handleCreateNewNote = () => {
        navigate('/notes/new');
    };

    return (
        <>
            <div
                className={`fixed top-0 left-0 h-screen flex flex-col justify-between font-inter bg-card border-r border-border
        transition-all duration-300 ${collapsed ? "w-25" : "w-58"}`}
            >
                {/* Header */}
                <div className={`flex items-center p-2 ${collapsed ? "justify-center" : "justify-between"}`}>
                    {!collapsed && (
                        <div className="flex items-center gap-2 p-2">
                            <span className="font-bold font-gabarito text-lg bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                Aeternus
                            </span>
                        </div>
                    )}

                    {/* Action buttons - ĐỔI VỊ TRÍ Ở ĐÂY */}
                    <div className={`flex items-center gap-1 ${collapsed ? "justify-center" : ""}`}>
                        {/* Add Note button - chỉ hiển thị khi sidebar mở rộng */}
                        {!collapsed && (
                            <button
                                onClick={handleCreateNewNote}
                                className="p-1 rounded hover:bg-muted transition-colors text-foreground"
                                title="Add new note"
                            >
                                <FilePlus size={16} />
                            </button>
                        )}

                        {/* Toggle button */}
                        <button
                            className="p-1 rounded hover:bg-muted transition-colors text-foreground"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <Menu size={16} />
                        </button>
                    </div>
                </div>

                {/* Main buttons */}
                <div className={`${collapsed ? "items-center" : "items-stretch"} px-1`}>
                    <SidebarMainButtons collapsed={collapsed} />
                </div>
                <div className={`flex flex-col flex-1 overflow-y-auto mt-2 ${collapsed ? "items-center" : "items-stretch"} px-1`}>
                    {!collapsed && <SidebarTeamspace collapsed={collapsed} />}
                </div>
                {/* Footer */}
                <div className={`${collapsed ? "items-center" : "items-stretch"} px-1`}>
                    <SidebarFooter
                        collapsed={collapsed}
                        onOpenTrashModal={openTrashModal}
                        onOpenSettingsModal={openSettingsModal}
                    />
                </div>
            </div>

            {/* Trash Modal */}
            <TrashModal
                isOpen={isTrashModalOpen}
                onClose={closeTrashModal}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={closeSettingsModal}
            />
        </>
    );
}