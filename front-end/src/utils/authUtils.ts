// utils/authUtils.ts

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: 'user' | 'admin' | 'moderator';
    permissions: string[];
  }
  
  const BACKEND_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5000';
  
  /**
   * Get current user from localStorage
   */
  export const getCurrentUser = (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };
  
  /**
   * Check if user is authenticated
   */
  export const isAuthenticated = (): boolean => {
    return !!getCurrentUser();
  };
  
  /**
   * Check if user has specific role
   */
  export const hasRole = (role: string | string[]): boolean => {
    const user = getCurrentUser();
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };
  
  /**
   * Check if user has specific permission
   */
  export const hasPermission = (permission: string): boolean => {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin' || user.permissions.includes('admin')) {
      return true;
    }
    
    return user.permissions.includes(permission);
  };
  
  /**
   * Verify authentication with backend
   */
  export const verifyAuth = async (): Promise<User | null> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      } else {
        localStorage.removeItem('user');
        return null;
      }
    } catch (error) {
      console.error('Verify auth error:', error);
      localStorage.removeItem('user');
      return null;
    }
  };
  
  /**
   * Logout user
   */
  export const logout = async (): Promise<void> => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
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
  
  /**
   * Login with Google
   */
  export const loginWithGoogle = (): void => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };
  
  /**
   * Get user initials for avatar
   */
  export const getUserInitials = (name: string): string => {
    if (!name) return '?';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  /**
   * Get role badge color
   */
  export const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  /**
   * Get role display name
   */
  export const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      case 'user':
        return 'User';
      default:
        return 'Guest';
    }
  };