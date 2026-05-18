import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            
            const response = await api.get('/user');
            setUser(response.data.user);
        } catch (error) {
            console.error('Erreur chargement utilisateur:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        loadUser();
    }, [loadUser]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            
            toast.success('Connexion réussie !');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur de connexion';
            toast.error(message);
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/register', userData);
            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            
            toast.success('Inscription réussie !');
            return { success: true };
        } catch (error) {
            const errors = error.response?.data?.errors;
            if (errors) {
                Object.values(errors).forEach(err => toast.error(err[0]));
            } else {
                toast.error('Erreur lors de l\'inscription');
            }
            return { success: false, errors };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            toast.info('Déconnecté');
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            updateUser,
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};