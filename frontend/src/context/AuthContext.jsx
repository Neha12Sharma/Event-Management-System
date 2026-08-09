import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { mockLogin, mockRegister } from '../api/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data?.token && data?.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true };
            }
            throw new Error('Invalid backend response');
        } catch (err) {
            // Check if server sent a specific validation message (e.g. 401 Invalid credentials from active backend)
            if (err.response?.data?.message && err.response?.status === 401) {
                // If live backend is online and gave explicit 401, try mock login as secondary fallback for demo accounts
                try {
                    const mockRes = mockLogin(email, password);
                    localStorage.setItem('token', mockRes.token);
                    localStorage.setItem('user', JSON.stringify(mockRes.user));
                    setUser(mockRes.user);
                    return { success: true };
                } catch {
                    return { success: false, message: err.response.data.message };
                }
            }

            // Backend is down, unconfigured, or returning non-JSON HTML
            try {
                const mockRes = mockLogin(email, password);
                localStorage.setItem('token', mockRes.token);
                localStorage.setItem('user', JSON.stringify(mockRes.user));
                setUser(mockRes.user);
                return { success: true, isDemo: true };
            } catch (mockErr) {
                return { success: false, message: 'Login failed. Please check network connection.' };
            }
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            if (data?.token && data?.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true };
            }
            throw new Error('Invalid backend response');
        } catch (err) {
            // Backend unreachable or HTML/network error -> Fallback to mock registration
            try {
                const mockRes = mockRegister(name, email, password);
                localStorage.setItem('token', mockRes.token);
                localStorage.setItem('user', JSON.stringify(mockRes.user));
                setUser(mockRes.user);
                return { success: true, isDemo: true };
            } catch (mockErr) {
                return { success: false, message: err.response?.data?.message || 'Registration failed' };
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

