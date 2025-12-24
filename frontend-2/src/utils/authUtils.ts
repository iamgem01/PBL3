// utils/authUtils.ts

export interface User {
    userId: string;    
    email: string;
    name: string; 
    avatar?: string;
    roles: string;  
    createdAt?: string;
    theme?: "dark" | "light";
    accessToken?: string;
}
  
// URL Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

export const getCurrentUser = (): User | null => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if(!user.theme) user.theme = 'light';
        return user;
    }
    return null;
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

// Helper để lấy Header chứa Token từ sessionStorage
export const getAuthHeaders = (): HeadersInit => {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.userId) {
                headers['X-User-Id'] = user.userId;
            }
        } catch (e) {
            console.error("Error parsing user from session storage", e);
        }
    }
    return headers;
};

export const verifyAuth = async (): Promise<User | null> => {
    console.log("Called from authUtils 222");
    try {
        const response = await fetch(`${API_GATEWAY_URL}/api/auth/me`, {
            credentials: 'include',
            headers: getAuthHeaders() as Record<string, string>, // Gửi token nếu có trong sessionStorage
        });
        console.log("Complete");

        if (response.ok) {
            const user = await response.json();
            // KHÔNG auto-save token ở đây nữa. 
            if (!user.theme) {
                const sessionUser = getCurrentUser();
                user.theme = sessionUser?.theme || 'light'; // Ưu tiên giữ theme cũ từ session nếu server trả về null
            }
            // Việc save sẽ do AuthInit (SessionRestoreModal) hoặc Login page quyết định.
            return user;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Verify auth error:', error);
        // Không xóa user ngay nếu lỗi mạng, chỉ xóa khi 401
        return null;
    }
};

export const logout = async (check: boolean): Promise<void> => {
    if(check) {return; }
    try {
        await fetch(`${API_GATEWAY_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearUserSession();
        window.location.href = '/';
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

export const updateUserTheme = async (theme: string): Promise<void> => {
    try {
        await fetch(`${API_GATEWAY_URL}/api/auth/theme?theme=${theme}`, {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders() as Record<string, string>
        });
        // Cập nhật ngay lập tức vào session storage để UI phản hồi
        updateSessionTheme(theme as "dark" | "light");
    } catch (error) {
        console.error('Error updating theme:', error);
    }
}

export const saveUserSession = (user: User) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    if (user.accessToken) {
        sessionStorage.setItem('token', user.accessToken);
    }
};

export const clearUserSession = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
};

export const updateSessionTheme = (theme: "dark" | "light" | "system") => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        user.theme = theme;
        sessionStorage.setItem('user', JSON.stringify(user));
    }
};
