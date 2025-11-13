import BaseModal from "./BaseModal";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="⚙️ Settings" width="w-[520px]">
            <div className="space-y-6 text-sm text-gray-700">
                <section>
                    <h3 className="font-semibold mb-2 text-gray-800">Appearance</h3>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span>Dark Mode</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition"></div>
                            <div className="absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                        </label>
                    </div>
                </section>

                <section>
                    <h3 className="font-semibold mb-2 text-gray-800">Account</h3>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p>Email: <span className="text-gray-500">gem@example.com</span></p>
                        <p className="mt-2 text-blue-600 hover:underline cursor-pointer">Manage account</p>
                    </div>
                </section>

                <section>
                    <h3 className="font-semibold mb-2 text-gray-800">Notifications</h3>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span>Email updates</span>
                        <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                    </div>
                </section>
            </div>
        </BaseModal>
    );
}
