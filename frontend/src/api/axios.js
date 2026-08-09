import axios from 'axios';

const getBaseURL = () => {
    const url = import.meta.env.VITE_API_URL;
    if (!url) return '/api';
    return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally without disrupting demo/mock sessions or auth flow
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
        const token = localStorage.getItem('token');
        const isDemoToken = token && token.startsWith('demo-jwt-token-');

        if (error.response?.status === 401 && !isAuthEndpoint && !isDemoToken) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

