import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/users';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn, redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const userApi = {
    // Authentication
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (userData: any) =>
        api.post('/auth/register', userData),

    logout: () =>
        api.post('/auth/logout'),

    // User Management
    getUsers: (page: number = 0, size: number = 10) =>
        api.get('/users', { params: { page, size } }),

    getUserById: (id: string) =>
        api.get(`/users/${id}`),

    updateUser: (id: string, userData: any) =>
        api.put(`/users/${id}`, userData),

    deleteUser: (id: string) =>
        api.delete(`/users/${id}`),

    suspendUser: (id: string) =>
        api.patch(`/users/${id}/suspend`),

    activateUser: (id: string) =>
        api.patch(`/users/${id}/activate`),

    // Profile
    getProfile: () =>
        api.get('/profile'),

    updateProfile: (profileData: any) =>
        api.put('/profile', profileData),

    changePassword: (passwordData: any) =>
        api.post('/profile/change-password', passwordData),

    // Admin Stats
    getSystemStats: () =>
        api.get('/admin/stats'),

    getUserActivity: (days: number = 7) =>
        api.get('/admin/activity', { params: { days } }),

    getStorageStats: () =>
        api.get('/admin/storage'),
};

export default api;