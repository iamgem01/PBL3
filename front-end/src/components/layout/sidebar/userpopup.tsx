"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, Plus } from "lucide-react";
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceMotal";


interface UserMenuProps {
    collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
    const [open, setOpen] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [menuPosition, setMenuPosition] = useState<"left" | "right">("right");
    const menuRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                avatarRef.current &&
                !avatarRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open && avatarRef.current) {
            const rect = avatarRef.current.getBoundingClientRect();
            const menuWidth = 240;
            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;
            setMenuPosition(spaceRight < menuWidth && spaceLeft > menuWidth ? "left" : "right");
        }
    }, [open, collapsed]);

    return (
        <div className="relative font-inter">
            {/* Avatar */}
            <div
                ref={avatarRef}
                className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-800 cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                A
            </div>

            {/* Menu popup */}
            {open && (
                <div
                    ref={menuRef}
                    className={`absolute bottom-full mb-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-sm ${
                        menuPosition === "right" ? "-right-30" : "left-0"
                    }`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold">Admin User</div>
                        <Settings size={16} className="text-gray-500 cursor-pointer" />
                    </div>
                    <div className="mb-2 text-gray-500 text-xs">Free Plan · 1 member</div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="space-y-2">
                        <button className="w-full text-left hover:bg-gray-100 rounded px-2 py-1"
                        >
                            Invite members
                        </button>
                        <button
                            className="w-full text-left hover:bg-gray-100 rounded px-2 py-1 flex items-center gap-1"
                            onClick={() => setOpenCreate(true)}
                        >
                            <Plus size={14} /> New workspace
                        </button>
                        <button className="w-full text-left hover:bg-gray-100 rounded px-2 py-1">
                            Add another account
                        </button>
                        <button className="w-full text-left hover:bg-gray-100 rounded px-2 py-1">
                            Log out
                        </button>
                    </div>
                </div>
            )}

            {/* Gọi modal riêng */}
            <CreateWorkspaceModal isOpen={openCreate} onClose={() => setOpenCreate(false)}/>

        </div>
    );
}
