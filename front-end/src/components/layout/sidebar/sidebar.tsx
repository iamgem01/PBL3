import type { Dispatch, SetStateAction } from "react";
import SidebarMainButtons from "./sidebarfeatures";
import SidebarTeamspace from "./sidebarteamspace";
import { SidebarFooter } from "./sidebarfooter";
import { Menu } from "lucide-react";

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    return (
        <div
            className={`fixed top-0 left-0 h-screen flex flex-col justify-between font-inter bg-white border-r border-gray-200
        transition-all duration-300 ${collapsed ? "w-25" : "w-58"}`}
        >
            {/* Header */}
            <div className={`flex items-center justify-between p-2 ${collapsed ? "justify-center" : "justify-between"}`}>
                {!collapsed && (
                    <div className="flex items-center gap-2 p-2">
                       {/*//<BookOpen size={20} className="text-indigo-600" />//*/}
                        <span className="font-bold font-gabarito text-lg bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                            Aeternus
                        </span>
                    </div>
                )}

                {/* Toggle button */}
                <button
                    className="p-1 rounded hover:bg-gray-100 transition-colors mx-auto"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <Menu size={20} />
                </button>
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
                <SidebarFooter collapsed={collapsed} />
            </div>
        </div>
    );
}
