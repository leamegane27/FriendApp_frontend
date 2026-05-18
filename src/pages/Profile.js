import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/Posts/PostCard';
import { toast } from 'react-toastify';

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [friendStatus, setFriendStatus] = useState(null);

    const loadProfile = useCallback(async () => {
        // Vérifier si l'utilisateur est connecté
        if (authLoading) return;
        
        // Si userId est undefined ou null, rediriger vers son propre profil
        let targetUserId = userId;
        if (!targetUserId && currentUser) {
            targetUserId = currentUser.id;
            navigate(`/profile/${currentUser.id}`, { replace: true });
            return;
        }
        
        if (!targetUserId) {
            console.error('userId invalide:', userId);
            toast.error('Utilisateur non trouvé');
            navigate('/feed');
            return;
        }

        try {
            setLoading(true);
            console.log('Chargement du profil pour userId:', targetUserId);
            
            const response = await api.get(`/profile/${targetUserId}`);
            console.log('Réponse profil:', response.data);
            
            setProfile(response.data.user);
            setFriendStatus(response.data.relationship);
            
            // Charger les posts de l'utilisateur
            const postsResponse = await api.get(`/profile/${targetUserId}/posts`);
            setPosts(postsResponse.data.data.data || []);
        } catch (error) {
            console.error('Erreur chargement profil:', error);
            if (error.response?.status === 404) {
                toast.error('Profil non trouvé');
                navigate('/feed');
            } else {
                toast.error('Erreur lors du chargement du profil');
            }
        } finally {
            setLoading(false);
        }
    }, [userId, navigate, currentUser, authLoading]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleSendFriendRequest = async () => {
        if (!profile) return;
        try {
            await api.post(`/friends/${profile.id}/request`);
            toast.success('Demande d\'ami envoyée');
            setFriendStatus({ has_pending_request: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
        }
    };

    const handleAcceptRequest = async () => {
        if (!profile) return;
        try {
            await api.put(`/friends/${profile.id}/accept`);
            toast.success('Demande acceptée');
            setFriendStatus({ is_friend: true });
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const handleRemoveFriend = async () => {
        if (!profile) return;
        try {
            await api.delete(`/friends/${profile.id}`);
            toast.success('Ami supprimé');
            setFriendStatus({ is_friend: false });
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const getAvatarUrl = (avatar, name) => {
        if (avatar) {
            return `${process.env.REACT_APP_STORAGE_URL}/${avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
    };

    const getCoverUrl = (coverPhoto) => {
        if (coverPhoto) {
            return `${process.env.REACT_APP_STORAGE_URL}/${coverPhoto}`;
        }
        return 'https://via.placeholder.com/1200x300/6366f1/ffffff?text=Couverture';
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div>
                <p className="ml-3 text-gray-500">Chargement...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div>
                <p className="ml-3 text-gray-500">Chargement du profil...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Profil non trouvé
                    </h3>
                    <button 
                        onClick={() => navigate('/feed')}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Retour au feed
                    </button>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Photo de couverture */}
            <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600">
                <img 
                    src={getCoverUrl(profile.cover_photo)} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            </div>
            
            {/* Avatar et infos */}
            <div className="relative px-4">
                <div className="absolute -top-16 left-4">
                    <img 
                        src={getAvatarUrl(profile.avatar, profile.name)} 
                        alt={profile.name}
                        className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                </div>
                
                <div className="ml-36 pt-4">
                    <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                    <p className="text-gray-600">@{profile.username}</p>
                    {profile.bio && (
                        <p className="mt-2 text-gray-700">{profile.bio}</p>
                    )}
                    {profile.location && (
                        <p className="text-gray-500 text-sm mt-1">📍 {profile.location}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>📅 Inscrit le {new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                
                {/* Boutons d'action */}
                {!isOwnProfile && (
                    <div className="mt-4 ml-36 flex space-x-2">
                        {friendStatus?.is_friend ? (
                            <button
                                onClick={handleRemoveFriend}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Supprimer l'ami
                            </button>
                        ) : friendStatus?.has_pending_request ? (
                            <button
                                onClick={handleAcceptRequest}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                            >
                                Accepter la demande
                            </button>
                        ) : (
                            <button
                                onClick={handleSendFriendRequest}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-md"
                            >
                                Ajouter en ami
                            </button>
                        )}
                    </div>
                )}
                
                {/* Statistiques */}
                <div className="mt-6 ml-36 flex space-x-6 border-t border-gray-100 pt-4">
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{profile.posts_count || posts.length}</div>
                        <div className="text-sm text-gray-500">Publications</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{profile.friends_count || 0}</div>
                        <div className="text-sm text-gray-500">Amis</div>
                    </div>
                </div>
            </div>
            
            {/* Posts */}
            <div className="mt-8 px-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Publications</h2>
                {posts.length === 0 ? (
                    <div className="text-center bg-white rounded-xl shadow p-8">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-gray-500">
                            {isOwnProfile ? "Vous n'avez pas encore de publications" : `${profile.name} n'a pas encore de publications`}
                        </p>
                        {isOwnProfile && (
                            <button 
                                onClick={() => {
                                    const createBtn = document.querySelector('[data-create-post]');
                                    if (createBtn) createBtn.click();
                                }}
                                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                            >
                                Créer ma première publication
                            </button>
                        )}
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onLike={() => {}}
                            onDelete={() => {}}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default Profile;