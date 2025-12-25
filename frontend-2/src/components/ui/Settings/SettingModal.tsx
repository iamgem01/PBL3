import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import { getCurrentUser } from "@/utils/authUtils";
import { getLoginHistory, type LoginSession } from "@/services/userService";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Monitor, Smartphone, Laptop } from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, toggleTheme } = useTheme();
    const [loginHistory, setLoginHistory] = useState<LoginSession[]>([]);
    const user = getCurrentUser();

    useEffect(() => {
        const fetchHistory = async () => {
            const history = await getLoginHistory();
            // Sắp xếp theo thời gian mới nhất và lấy 3 cái đầu
            const sorted = history.sort((a, b) => 
                new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
            ).slice(0, 3);
            setLoginHistory(sorted);
        };
        fetchHistory();
    }, []); // Chạy 1 lần khi mount (vào trang/reload)

    const getDeviceIcon = (device: string) => {
        const d = device.toLowerCase();
        if (d.includes('mobile') || d.includes('iphone') || d.includes('android')) return <Smartphone className="w-4 h-4 text-purple-600" />;
        if (d.includes('macbook') || d.includes('laptop')) return <Laptop className="w-4 h-4 text-orange-600" />;
        return <Monitor className="w-4 h-4 text-blue-600" />;
    };

    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return 'Unknown';
        
        // Đảm bảo xử lý đúng giờ UTC nếu chuỗi thiếu ký tự timezone (Z)
        const dateValue = !dateString.endsWith("Z") && !/[+-]\d{2}:\d{2}/.test(dateString)
            ? `${dateString}Z`
            : dateString;
            
        const date = new Date(dateValue);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return date.toLocaleDateString();
    };

    const getPlanName = () => {
        if (!user) return 'Free Plan';
        if (user.roles.includes('Admin')) return 'Pro Plan';
        if (user.roles.includes('Admin')) return 'Pro Plan';
        return 'Free Plan';
    };

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
                                <span className="font-medium text-gray-900 dark:text-gray-100">{user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                    {getPlanName()}
                                </span>
                            </div>
                        </div>
                        {/* <button className="mt-3 w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                            Manage account →
                        </button> */}
                    </div>
                </section>

                {/* Security Section */}
                <section>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="text-lg">🛡️</span>
                        Security
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Login Activity</div>
                        <div className="space-y-4">
                            {loginHistory.length > 0 ? (
                                loginHistory.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                                                {getDeviceIcon(session.device)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700 dark:text-gray-300">{session.device}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {session.browser} • {session.current ? 'Active now' : formatTimeAgo(session.lastActive)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-2">No recent activity found.</p>
                            )}
                        </div>
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