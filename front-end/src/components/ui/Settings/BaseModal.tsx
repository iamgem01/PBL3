interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string;
}

export default function BaseModal({
    isOpen,
    onClose,
    title,
    children,
    width = "w-[480px]",
}: BaseModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className={`relative bg-card rounded-xl shadow-2xl border border-border p-6 ${width}`}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
                >
                    ✕
                </button>

                {/* Title */}
                {title && (
                    <h2 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">
                        {title}
                    </h2>
                )}

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}