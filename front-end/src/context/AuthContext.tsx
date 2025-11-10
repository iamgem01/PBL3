import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { userApi } from '@/services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('accessToken');
        if (token) {
            loadUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const response = await userApi.getProfile();
            setUser(response.data);
        } catch (error) {
            console.error('Failed to load user', error);
            localStorage.removeItem('accessToken');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await userApi.login(email, password);
        const { accessToken, user } = response.data;
        localStorage.setItem('accessToken', accessToken);
        setUser(user);
    };

    const logout = () => {
        userApi.logout().catch(console.error);
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    const register = async (userData: any) => {
        const response = await userApi.register(userData);
        const { accessToken, user } = response.data;
        localStorage.setItem('accessToken', accessToken);
        setUser(user);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                register,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};