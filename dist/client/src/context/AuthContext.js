import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchCurrentUser = async () => {
        const token = getAuthToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const res = await apiRequest('/auth/me');
            setUser(res.user);
        }
        catch (err) {
            removeAuthToken();
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCurrentUser();
    }, []);
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await apiRequest('/auth/login', 'POST', { email, password });
            setAuthToken(res.token);
            setUser(res.user);
        }
        finally {
            setLoading(false);
        }
    };
    const registerUser = async (data) => {
        setLoading(true);
        try {
            const res = await apiRequest('/auth/register', 'POST', data);
            setAuthToken(res.token);
            setUser(res.user);
        }
        finally {
            setLoading(false);
        }
    };
    const quickDemoLogin = async (role) => {
        let email = 'patient.john@example.com';
        let password = 'patient123';
        if (role === 'DOCTOR') {
            email = 'dr.smith@clinic.com';
            password = 'doctor123';
        }
        else if (role === 'ADMIN') {
            email = 'admin@clinic.com';
            password = 'admin123';
        }
        try {
            await login(email, password);
        }
        catch (err) {
            // If demo user doesn't exist, trigger seed and retry login
            await seedData();
            await login(email, password);
        }
    };
    const seedData = async () => {
        await apiRequest('/seed', 'POST');
    };
    const logout = () => {
        removeAuthToken();
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: { user, loading, login, registerUser, quickDemoLogin, logout, seedData }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within AuthProvider');
    return context;
};
