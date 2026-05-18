// src/components/Layout/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    Home, 
    Users, 
    MessageSquare, 
    Bell, 
    User, 
    LogOut, 
    Menu, 
    X,
    Settings,
    UserPlus,
    Search,
    Loader2
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Charger les infos utilisateur
    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await api.get('/user');
                setUser(response.data.data);
            } catch (error) {
                console.error('Erreur chargement utilisateur:', error);
            }
        };
        
        const token = localStorage.getItem('token');
        if (token) {
            loadUser();
        }
    }, []);

    // Charger les notifications
    useEffect(() => {
        const loadNotifications = async () => {
            setLoadingNotifications(true);
            try {
                const response = await api.get('/notifications');
                let notificationsData = [];
                
                if (response.data) {
                    if (Array.isArray(response.data)) {
                        notificationsData = response.data;
                    } else if (Array.isArray(response.data.data)) {
                        notificationsData = response.data.data;
                    }
                }
                
                setNotifications(notificationsData);
                const unread = notificationsData.filter(n => n && !n.read).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error('Erreur chargement notifications:', error);
                if (error.response?.status !== 404) {
                    toast.error('Erreur de chargement des notifications');
                }
                setNotifications([]);
                setUnreadCount(0);
            } finally {
                setLoadingNotifications(false);
            }
        };

        const token = localStorage.getItem('token');
        if (token) {
            loadNotifications();
            const interval = setInterval(loadNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, []);

    // Recherche d'utilisateurs
    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        if (term.trim().length > 1) {
            setIsSearching(true);
            try {
                const response = await api.get(`/search/users?q=${term}`);
                let results = [];
                
                if (response.data) {
                    if (Array.isArray(response.data)) {
                        results = response.data;
                    } else if (Array.isArray(response.data.data)) {
                        results = response.data.data;
                    }
                }
                
                setSearchResults(results);
                setShowSearchResults(true);
            } catch (error) {
                console.error('Erreur recherche:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setShowSearchResults(false);
            setSearchResults([]);
        }
    };

    // Déconnexion
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        toast.success('Déconnexion réussie');
        navigate('/login');
    };

    // Marquer une notification comme lue
    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Erreur marquage notification:', error);
        }
    };

    // Marquer toutes les notifications comme lues
    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success('Toutes les notifications ont été marquées comme lues');
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du marquage des notifications');
        }
    };

    // Navigation items
    const navItems = [
        { path: '/feed', icon: Home, label: 'Fil d\'actualité' },
        { path: '/friends', icon: Users, label: 'Amis' },
        { path: '/messages', icon: MessageSquare, label: 'Messages' },
    ];

    const getAvatarUrl = (avatar, name) => {
        if (avatar) {
            return `${process.env.REACT_APP_STORAGE_URL}/${avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff&bold=true`;
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/feed" className="flex items-center space-x-2">
                            <div className="bg-indigo-600 rounded-lg p-1.5">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-800 hidden sm:block">
                                FriendBook
                            </span>
                        </Link>
                    </div>

                    {/* Barre de recherche - Desktop */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher des amis..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-2.5">
                                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                                </div>
                            )}
                            
                            {/* Résultats de recherche */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
                                    {searchResults.map(result => (
                                        <Link
                                            key={result.id}
                                            to={`/profile/${result.id}`}
                                            onClick={() => {
                                                setShowSearchResults(false);
                                                setSearchTerm('');
                                            }}
                                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition"
                                        >
                                            <img
                                                src={getAvatarUrl(result.avatar, result.name)}
                                                alt={result.name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{result.name}</p>
                                                <p className="text-sm text-gray-500">@{result.username}</p>
                                            </div>
                                            <UserPlus className="h-5 w-5 text-indigo-600" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Desktop */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                                        isActive(item.path)
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`p-2 rounded-lg transition-colors relative ${
                                    isNotificationsOpen
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                                }`}
                            >
                                {loadingNotifications ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Bell className="h-5 w-5" />
                                )}
                                {unreadCount > 0 && !loadingNotifications && (
                                    <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Notifications */}
                            {isNotificationsOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsNotificationsOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border overflow-hidden">
                                        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-indigo-600 hover:text-indigo-700"
                                                >
                                                    Tout marquer comme lu
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                    <p className="text-sm">Aucune notification</p>
                                                </div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => {
                                                            markAsRead(notification.id);
                                                            setIsNotificationsOpen(false);
                                                        }}
                                                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${
                                                            !notification.read ? 'bg-indigo-50' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {notification.sender && (
                                                                <img
                                                                    src={getAvatarUrl(notification.sender.avatar, notification.sender.name)}
                                                                    alt=""
                                                                    className="h-8 w-8 rounded-full"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-900">{notification.content}</p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {new Date(notification.created_at).toLocaleString('fr-FR')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Profile Menu */}
                        <div className="relative ml-2">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition"
                            >
                                <img
                                    src={getAvatarUrl(user?.avatar, user?.name)}
                                    alt={user?.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                                    {user?.name?.split(' ')[0]}
                                </span>
                            </button>

                            {isProfileMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Mon profil</span>
                                        </Link>
                                        <Link
                                            to="/settings"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span>Paramètres</span>
                                        </Link>
                                        <hr className="my-1" />
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Déconnexion</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t py-4 space-y-2">
                        {/* Barre de recherche mobile */}
                        <div className="px-4 pb-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher des amis..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                                    </div>
                                )}
                                {showSearchResults && searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-64 overflow-y-auto">
                                        {searchResults.map(result => (
                                            <Link
                                                key={result.id}
                                                to={`/profile/${result.id}`}
                                                onClick={() => {
                                                    setShowSearchResults(false);
                                                    setIsMenuOpen(false);
                                                    setSearchTerm('');
                                                }}
                                                className="flex items-center space-x-3 p-3 hover:bg-gray-50"
                                            >
                                                <img
                                                    src={getAvatarUrl(result.avatar, result.name)}
                                                    alt={result.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-semibold">{result.name}</p>
                                                    <p className="text-sm text-gray-500">@{result.username}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg mx-2 transition ${
                                        isActive(item.path)
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                        
                        <hr className="my-2" />
                        
                        <Link
                            to="/settings"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 rounded-lg mx-2 text-gray-600 hover:bg-gray-100"
                        >
                            <Settings className="h-5 w-5" />
                            <span>Paramètres</span>
                        </Link>
                        
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                handleLogout();
                            }}
                            className="flex items-center space-x-3 px-4 py-2 rounded-lg mx-2 text-red-600 hover:bg-gray-100 w-full"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;