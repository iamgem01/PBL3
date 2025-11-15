import { useState } from "react";
import Sidebar from "@/components/layout/sidebar/sidebar";
import Dashboard from "@/components/layout/dashboard/dashboard";

export default function HomePage() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <main className={`transition-all duration-300 flex-1 ${collapsed ? "ml-20" : "ml-64"} p-6`}>
                <Dashboard />
            </main>
        </div>
    );
}