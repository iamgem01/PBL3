import { useState } from "react";

export default function ProfileDropdown() {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <div
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
            >
                <img src="/images/avatar.png" alt="User" className="w-8 h-8 rounded-full" />
                <div>
                    <p className="text-sm font-medium">Admin Hi</p>
                    <p className="text-xs text-gray-500">Admin</p>
                </div>
            </div>
            {open && (
                <div className="absolute bottom-12 left-0 bg-white border rounded-md shadow-md w-40 text-sm">
                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Profile</div>
                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Logout</div>
                </div>
            )}
        </div>
    );
}
