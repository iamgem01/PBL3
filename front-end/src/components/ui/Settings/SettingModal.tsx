import BaseModal from "./BaseModal";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="⚙️ Settings" width="w-[520px]">
            <div className="space-y-6 text-sm">
                {/* Appearance Section */}
                <section>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="text-lg">🎨</span>
                        Appearance
                    </h3>
                    
                    {/* Theme Toggle with Visual Feedback */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? (
                                    <Moon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                ) : (
                                    <Sun className="w-5 h-5 text-amber-500" />
                                )}
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        Dark Mode
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {theme === 'dark' ? 'Enabled' : 'Disabled'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Enhanced Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                />
                                <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 transition-colors  duration-300 relative">
                                    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-7 flex items-center justify-center">
                                        {theme === 'dark' ? (
                                            <Moon className="w-3 h-3 text-blue-600" />
                                        ) : (
                                            <Sun className="w-3 h-3 text-amber-500" />
                                        )}
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Theme Description */}
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-600">
                            {theme === 'dark' 
                                ? '🌙 Dark mode reduces eye strain in low-light environments'
                                : '☀️ Light mode provides better visibility in bright conditions'
                            }
                        </div>
                    </div>
                </section>

                {/* Account Section */}
                <section>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        Account
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">gem@example.com</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                    Premium
                                </span>
                            </div>
                        </div>
                        <button className="mt-3 w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                            Manage account →
                        </button>
                    </div>
                </section>

                {/* Notifications Section */}
                <section>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="text-lg">🔔</span>
                        Notifications
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <span className="text-gray-700 dark:text-gray-300">Email updates</span>
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 accent-blue-600 dark:accent-blue-500 rounded" 
                                defaultChecked
                            />
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <span className="text-gray-700 dark:text-gray-300">Push notifications</span>
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 accent-blue-600 dark:accent-blue-500 rounded" 
                            />
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                        <div>Version 1.0.0</div>
                        <div className="flex items-center justify-center gap-3">
                            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Privacy</a>
                            <span>•</span>
                            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Terms</a>
                            <span>•</span>
                            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Help</a>
                        </div>
                    </div>
                </section>
            </div>
        </BaseModal>
    );
}