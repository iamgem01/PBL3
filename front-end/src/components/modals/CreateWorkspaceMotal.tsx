"use client";

import { X, Building2, Apple, Chrome, User, Building } from "lucide-react";

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[420px] p-6 relative text-center animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center mb-4">
                    <Building2 className="text-gray-700 mb-2" size={36} />
                    <h2 className="text-xl font-semibold">Create a work account</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        We’ll check if your teammates are already on the platform.
                        If not, we’ll create a new home for you and your team.
                    </p>
                </div>

                <div className="space-y-3 mt-5">
                    <button className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 transition">
                        <Chrome className="text-[#4285F4]" size={18} />
                        Continue with Google
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 transition">
                        <Apple size={18} />
                        Continue with Apple
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 transition">
                        <Building size={18} className="text-[#0078D4]" />
                        Continue with Microsoft
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 transition">
                        <User size={18} />
                        Log in with passkey
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 transition">
                        <Building2 size={18} />
                        Single sign-on (SSO)
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
