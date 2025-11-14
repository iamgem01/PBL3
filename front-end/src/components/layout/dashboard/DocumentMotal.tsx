import { X } from "lucide-react";
import DocumentBlock from "@/components/ui/documentBlock";
import type { DocumentBlockType } from "@/data/documentContent";

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: DocumentBlockType[] | null;
}

export default function DocumentModal({ isOpen, onClose, content }: DocumentModalProps) {
    if (!isOpen || !content) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Lớp nền mờ */}
            <div
                className="absolute inset-0 bg-black/40 "style={{ backdropFilter: 'none' }}
                onClick={onClose}
            />

            {/* Popup chính */}
            <div className="relative z-10 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-2xl max-w-3xl w-[90%] max-h-[80vh] overflow-y-auto p-8 animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                >
                    <X size={20} />
                </button>

                <div className="font-inter text-gray-800">
                    {content.map((block, index) => (
                        <DocumentBlock key={index} block={block} />
                    ))}
                </div>
            </div>
        </div>
    );
}
