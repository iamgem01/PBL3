// utils/authUtils.ts

export interface User {
    userId: string;    // Sửa id -> userId (theo DTO)
    email: string;
    username: string;  // Sửa name -> username
    avatar?: string;
    roles: string[];   // Sửa role (string) -> roles (array string)
    createdAt?: string;
}
  
// URL Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

export const getCurrentUser = (): User | null => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
    }
};

export const isAuthenticated = (): boolean => {
    return !!getCurrentUser();
};

export const hasRole = (roleName: string): boolean => {
    const user = getCurrentUser();
    if (!user || !user.roles) return false;
    // Backend trả về "USER", "ADMIN", frontend kiểm tra tương ứng
    return user.roles.includes(roleName);
};

export const verifyAuth = async (): Promise<User | null> => {
    try {
        // Gọi API /api/users/me thông qua Gateway
        const response = await fetch(`${API_GATEWAY_URL}/api/users/me`, {
            credentials: 'include',
        });

        if (response.ok) {
            const data: User = await response.json();
            localStorage.setItem('user', JSON.stringify(data));
            console.log("Googges");
            return data;
        } else {
            localStorage.removeItem('user');
            return null;
        }
    } catch (error) {
        console.error('Verify auth error:', error);
        // Không xóa user ngay nếu lỗi mạng, chỉ xóa khi 401
        return null;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await fetch(`${API_GATEWAY_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

export const loginWithGoogle = (): void => {
    // Chuyển hướng đến endpoint bắt đầu OAuth2 của User Service (qua Kong)
    window.location.href = `${API_GATEWAY_URL}/oauth2/authorization/google`;
};

export const getUserInitials = (name: string): string => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
};