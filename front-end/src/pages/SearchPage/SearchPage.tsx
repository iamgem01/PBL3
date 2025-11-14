import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/sidebar/sidebar";
import SearchBox from "@/components/ui/searchBox";

export default function SearchPage() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleCloseSearch = () => {
        navigate(-1); 
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className={`transition-all duration-300 flex-1 overflow-y-auto ${collapsed ? "ml-20" : "ml-64"}`}>
                {/* Container để hiển thị SearchBox modal */}
                <div className="min-h-screen flex items-center justify-center p-6">
                    <SearchBox onClose={handleCloseSearch} />
                </div>
            </main>
        </div>
    );
}