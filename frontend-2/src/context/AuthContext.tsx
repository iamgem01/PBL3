// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { verifyAuth, logout as utilLogout, updateUserTheme as utilUpdateTheme, type User as AuthUser, getCurrentUser, saveUserSession, clearUserSession } from '../utils/authUtils'; // Hợp nhất logic gọi API

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  theme?: 'light' | 'dark'; // Thêm theme vào đây
  role: 'user' | 'admin' | 'moderator';
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  updateTheme: (theme: 'light' | 'dark') => Promise<void>; // Thêm hàm updateTheme
}
// Không cần gọi API trực tiếp ở đây nữa, sẽ dùng authUtils
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Khởi tạo state từ sessionStorage để tránh flash loading/login khi reload
  const [user, setUser] = useState<User | null>(() => {
    const sessionUser = getCurrentUser();
    if (sessionUser) {
      return {
        id: sessionUser.userId,
        name: sessionUser.name,
        email: sessionUser.email,
        avatar: sessionUser.avatar,
        theme: (sessionUser.theme as 'light' | 'dark') || 'light',
        role: 'user',
        permissions: [],
      };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!user);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log("call verifyAuth from auth Context");
    try {
      // Sử dụng hàm xác thực tập trung từ authUtils
      const userFromAuth: AuthUser | null = await verifyAuth();
      
      if (userFromAuth) {
        // 2. Lưu lại vào sessionStorage để đồng bộ cho các lần reload sau
        saveUserSession(userFromAuth);

        // TODO: Cần hợp nhất kiểu dữ liệu 'User' giữa các file.
        // Tạm thời chuyển đổi để phù hợp với interface của AuthContext.
        const adaptedUser: User = {
          id: userFromAuth.userId,
          name: userFromAuth.name,
          email: userFromAuth.email,
          avatar: userFromAuth.avatar,
          theme: (userFromAuth.theme as 'light' | 'dark') || 'light', // Lấy theme từ API, fallback light
          role: 'user', // Giả định role, cần được trả về từ API
          permissions: [], // Giả định permissions, cần được trả về từ API
        };
        setUser(adaptedUser);
      } else {
        setUser(null);
        clearUserSession();
      }
    } catch (error) {
      console.error('Check auth error:', error);
      setUser(null);
      clearUserSession();
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // Chuyển hướng đến endpoint OAuth2 của API Gateway (sử dụng đường dẫn tương đối)
    window.location.href = `/oauth2/authorization/google`;
  };

  const logout = async () => {
    try {
      // Gọi hàm logout tập trung và không reload trang
      await utilLogout(false);
      setUser(null);
      // Chuyển hướng về trang login sau khi đăng xuất thành công
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Admin has all permissions
    if (user.role === 'admin' || user.permissions.includes('admin')) {
      return true;
    }
    return user.permissions.includes(permission);
  };

  const updateTheme = async (newTheme: 'light' | 'dark') => {
    if (user) {
      // 1. Cập nhật State React ngay lập tức để UI phản hồi nhanh (Optimistic update)
      setUser({ ...user, theme: newTheme });
      
      // 2. Gọi Utils để cập nhật API và SessionStorage
      await utilUpdateTheme(newTheme);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
    hasRole,
    hasPermission,
    updateTheme,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook để lấy current user ID với validation
export const useCurrentUserId = () => {
  const { user } = useAuth();
  
  if (!user || !user.id) {
    console.error('❌ No authenticated user found');
    throw new Error('User not authenticated');
  }
  
  return user.id;
};

// Hook để validate user ownership
export const useUserOwnership = () => {
  const currentUserId = useCurrentUserId();
  
  const isOwner = (item: any) => {
    return item.createdBy === currentUserId;
  };
  
  const filterOwnedItems = (items: any[]) => {
    return items.filter(item => isOwner(item));
  };
  
  return { isOwner, filterOwnedItems, currentUserId };
};
