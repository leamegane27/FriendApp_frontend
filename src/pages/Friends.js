import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Users, Mail, UserPlus, Search, ChevronLeft, ChevronRight, UserCheck, UserX, Loader2, User } from 'lucide-react';

function Friends() {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [activeTab, setActiveTab] = useState('friends');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    // Charger les données
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'friends') {
                const response = await api.get('/friends');
                console.log('Amis reçus:', response.data);
                
                // Extraire les données correctement
                let friendsData = [];
                if (response.data && response.data.data) {
                    if (response.data.data.data) {
                        friendsData = response.data.data.data;
                    } else if (Array.isArray(response.data.data)) {
                        friendsData = response.data.data;
                    }
                } else if (Array.isArray(response.data)) {
                    friendsData = response.data;
                }
                setFriends(friendsData);
                
            } else if (activeTab === 'requests') {
                const response = await api.get('/friend-requests');
                console.log('Demandes reçues:', response.data);
                
                let requestsData = [];
                if (response.data && response.data.data) {
                    if (response.data.data.data) {
                        requestsData = response.data.data.data;
                    } else if (Array.isArray(response.data.data)) {
                        requestsData = response.data.data;
                    }
                } else if (Array.isArray(response.data)) {
                    requestsData = response.data;
                }
                setRequests(requestsData);
                
            } else if (activeTab === 'suggestions') {
                const response = await api.get('/friends/suggestions');
                console.log('Suggestions reçues:', response.data);
                
                let suggestionsData = [];
                if (response.data && response.data.data) {
                    if (Array.isArray(response.data.data)) {
                        suggestionsData = response.data.data;
                    } else if (response.data.data.data) {
                        suggestionsData = response.data.data.data;
                    }
                } else if (Array.isArray(response.data)) {
                    suggestionsData = response.data;
                }
                setSuggestions(suggestionsData);
            }
        } catch (error) {
            console.error('Erreur de chargement:', error);
            if (error.response?.status !== 404) {
                toast.error('Erreur de chargement des données');
            }
            
            // Réinitialiser avec des tableaux vides
            if (activeTab === 'friends') setFriends([]);
            if (activeTab === 'requests') setRequests([]);
            if (activeTab === 'suggestions') setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filtrer selon la recherche
    const getFilteredData = () => {
        let data = [];
        if (activeTab === 'friends') data = friends;
        else if (activeTab === 'requests') data = requests;
        else data = suggestions;
        
        if (!searchTerm || searchTerm.trim() === '') return data;
        
        return data.filter(item => 
            item && (
                (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.username && item.username.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
    };

    // Gestion des actions
    const handleFriendAction = async (action, userId) => {
        if (!userId) {
            toast.error('ID utilisateur invalide');
            return;
        }
        
        setActionLoading(userId);
        try {
            if (action === 'accept') {
                await api.put(`/friends/${userId}/accept`);
                toast.success('Demande acceptée !');
            } else if (action === 'decline') {
                await api.delete(`/friends/${userId}/decline`);
                toast.success('Demande refusée');
            } else if (action === 'add') {
                await api.post(`/friends/${userId}/request`);
                toast.success('Demande d\'ami envoyée !');
            }
            loadData(); // Recharger les données
        } catch (error) {
            console.error('Erreur:', error);
            let errorMessage = 'Une erreur est survenue';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchTerm('');
    };

    const getAvatarUrl = (avatar, name) => {
        if (avatar) {
            if (avatar.startsWith('http')) return avatar;
            return `${process.env.REACT_APP_STORAGE_URL}/${avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff&bold=true`;
    };

    const filteredData = getFilteredData();
    const stats = {
        friends: friends.length,
        requests: requests.length,
        suggestions: suggestions.length
    };

    const EmptyState = ({ icon: Icon, title, message, action }) => (
        <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-4">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    {action.label}
                </button>
            )}
        </div>
    );

    const renderUserCard = (user, type) => {
        if (!user || !user.id) return null;
        
        const isFriend = type === 'friends';
        const isRequest = type === 'requests';
        const isSuggestion = type === 'suggestions';
        
        return (
            <div key={user.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-gray-100">
                <div className="flex items-center space-x-4">
                    <Link to={`/profile/${user.id}`} className="flex-shrink-0">
                        <img
                            src={getAvatarUrl(user.avatar, user.name)}
                            alt={user.name}
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-100 hover:ring-indigo-300 transition-all"
                        />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                        <Link to={`/profile/${user.id}`} className="block">
                            <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate">
                                {user.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                            {user.bio && (
                                <p className="text-xs text-gray-400 mt-1 truncate">{user.bio}</p>
                            )}
                        </Link>
                    </div>
                    
                    <div className="flex-shrink-0">
                        {isFriend && (
                            <Link
                                to={`/profile/${user.id}`}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium inline-flex items-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                Voir profil
                            </Link>
                        )}
                        
                        {isRequest && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleFriendAction('accept', user.id)}
                                    disabled={actionLoading === user.id}
                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                    Accepter
                                </button>
                                <button
                                    onClick={() => handleFriendAction('decline', user.id)}
                                    disabled={actionLoading === user.id}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                                    Refuser
                                </button>
                            </div>
                        )}
                        
                        {isSuggestion && (
                            <button
                                onClick={() => handleFriendAction('add', user.id)}
                                disabled={actionLoading === user.id}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Ajouter
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading && filteredData.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* En-tête */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-7 h-7 text-indigo-600" />
                                Amis
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Gérez vos relations et découvrez de nouvelles personnes
                            </p>
                        </div>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Onglets */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="flex border-b border-gray-200 px-4">
                        <button
                            onClick={() => handleTabChange('friends')}
                            className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                activeTab === 'friends'
                                    ? 'text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Mes amis
                                {stats.friends > 0 && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        activeTab === 'friends' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {stats.friends}
                                    </span>
                                )}
                            </span>
                            {activeTab === 'friends' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                            )}
                        </button>
                        
                        <button
                            onClick={() => handleTabChange('requests')}
                            className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                activeTab === 'requests'
                                    ? 'text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Demandes
                                {stats.requests > 0 && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        activeTab === 'requests' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {stats.requests}
                                    </span>
                                )}
                            </span>
                            {activeTab === 'requests' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                            )}
                        </button>
                        
                        <button
                            onClick={() => handleTabChange('suggestions')}
                            className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                activeTab === 'suggestions'
                                    ? 'text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Suggestions
                            </span>
                            {activeTab === 'suggestions' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    {filteredData.length === 0 ? (
                        <EmptyState 
                            icon={activeTab === 'friends' ? Users : (activeTab === 'requests' ? Mail : UserPlus)}
                            title={
                                activeTab === 'friends' ? 'Pas encore d\'amis' :
                                activeTab === 'requests' ? 'Aucune demande en attente' :
                                'Aucune suggestion'
                            }
                            message={
                                activeTab === 'friends' ? 'Ajoutez des amis pour commencer à interagir avec eux !' :
                                activeTab === 'requests' ? 'Vous n\'avez pas de demandes d\'amis pour le moment.' :
                                'Revenez plus tard pour découvrir de nouvelles personnes.'
                            }
                            action={
                                activeTab === 'friends' ? { label: 'Découvrir des suggestions', onClick: () => handleTabChange('suggestions') } : null
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredData.map(user => renderUserCard(user, activeTab))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Friends;