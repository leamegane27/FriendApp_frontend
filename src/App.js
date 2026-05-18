import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Messages from './pages/Messages';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Notifications from './pages/Notifications';

// Composant pour protéger les routes
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div>
            </div>
        );
    }
    
    return user ? children : <Navigate to="/login" />;
};

// Composant pour les routes publiques (redirige vers feed si déjà connecté)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div>
            </div>
        );
    }
    
    return !user ? children : <Navigate to="/feed" />;
};

function AppContent() {
    const { user } = useAuth();

    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                {/* Afficher la Navbar seulement si l'utilisateur est connecté */}
                {user && <Navbar />}
                
                {/* Ajouter un padding-top seulement si la Navbar est affichée */}
                <div className={user ? 'pt-16' : ''}>
                    <Routes>
                        {/* Routes publiques - pas de Navbar */}
                        <Route path="/" element={
                            <PublicRoute>
                                <Landing />
                            </PublicRoute>
                        } />
                        <Route path="/login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        } />
                        
                        {/* Routes privées - avec Navbar */}
                        <Route path="/feed" element={
                            <PrivateRoute>
                                <Feed />
                            </PrivateRoute>
                        } />
                        <Route path="/profile/:userId" element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } />
                        <Route path="/friends" element={
                            <PrivateRoute>
                                <Friends />
                            </PrivateRoute>
                        } />
                        <Route path="/notifications" element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        } />
                        <Route path="/messages" element={
                            <PrivateRoute>
                                <Messages />
                            </PrivateRoute>
                        } />
                        <Route path="/profile" element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } />
                    </Routes>
                </div>
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;