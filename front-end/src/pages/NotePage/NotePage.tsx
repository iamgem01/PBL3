import { useState } from "react";
import Sidebar from "@/components/layout/sidebar/sidebar";
import Note from "@/components/layout/pagenote/Note";

export default function NotePage() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <main className={`transition-all flex-1 duration-300 flex-1 ${collapsed ? "ml-20" : "ml-64"} p-6`}>
                <Note />
            </main>
        </div>
    );
}
