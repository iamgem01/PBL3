interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string; // cho phép tuỳ chỉnh kích thước
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className={`relative bg-white rounded-xl shadow-2xl border border-gray-200 p-6 ${width}`}
            >
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                >
                    ✕
                </button>

                {/* Tiêu đề */}
                {title && (
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-100 pb-2">
                        {title}
                    </h2>
                )}

                {/* Nội dung */}
                <div className="max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
