import { getAuthHeaders } from "@/utils/authUtils";
import { handleResponse, USER_SERVICE_URL } from './utils';

/**
 * Service xử lý các tác vụ liên quan đến User
 */

export interface LoginSession {
    id: string;
    device: string;
    browser: string;
    lastActive: string;
    current: boolean;
}

export const updateUserTheme = async (theme: string): Promise<void> => {
    try {
        const response = await fetch(`${USER_SERVICE_URL}/api/users/theme?theme=${theme}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi cập nhật theme: ${response.status} ${response.statusText}`);
        }

        console.log(`Đã cập nhật theme thành công: ${theme}`);

    } catch (error) {
        console.error("Lỗi service updateUserTheme:", error);
        throw error;
    }
};

export const getLoginHistory = async (): Promise<LoginSession[]> => {
    try {
        const response = await fetch(`${USER_SERVICE_URL}/api/users/login-history`, {
            method: 'GET',
            headers: getAuthHeaders(),
            credentials: 'include',
        });

        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Error fetching login history:", error);
        return [];
    }
};