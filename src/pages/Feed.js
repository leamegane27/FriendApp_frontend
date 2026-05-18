import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import PostCard from '../components/Posts/PostCard';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusCircleIcon, UserGroupIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

function Feed() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [privacy, setPrivacy] = useState('public');
    const [posting, setPosting] = useState(false);
    const lastPostRef = useRef();

    const getAvatarUrl = () => {
        if (user?.avatar) {
            return `${process.env.REACT_APP_STORAGE_URL}/${user.avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=128`;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) {
            toast.error('Veuillez ajouter du contenu ou une image');
            return;
        }
        
        setPosting(true);
        
        const formData = new FormData();
        formData.append('content', content);
        formData.append('privacy', privacy);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Publication créée avec succès !');
            
            // Ajouter le nouveau post au début de la liste
            if (response.data.post) {
                setPosts([response.data.post, ...posts]);
            }
            
            // Fermer la modale et réinitialiser
            setShowModal(false);
            setContent('');
            setImage(null);
            setImagePreview(null);
            
            // Recharger le feed
            loadPosts(1, false);
        } catch (error) {
            console.error('Erreur création post:', error);
            toast.error('Erreur lors de la publication');
        } finally {
            setPosting(false);
        }
    };

    const loadPosts = useCallback(async (pageNum = 1, append = false) => {
        try {
            setError(null);
            const response = await api.get(`/posts/feed?page=${pageNum}`);
            
            let postsData = [];
            if (response.data.data && response.data.data.data) {
                postsData = response.data.data.data;
                setHasMore(response.data.data.current_page < response.data.data.last_page);
            } else if (response.data.data) {
                postsData = response.data.data;
                setHasMore(false);
            } else {
                postsData = response.data;
                setHasMore(false);
            }
            
            if (append) {
                setPosts(prev => [...prev, ...postsData]);
            } else {
                setPosts(postsData);
            }
            
        } catch (error) {
            console.error('Erreur feed:', error);
            setError(error.response?.data?.message || error.message || 'Erreur lors du chargement du feed');
            toast.error('Erreur lors du chargement du feed');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        loadPosts(1, false);
    }, [loadPosts]);

    // Infinite scroll
    useEffect(() => {
        if (loading || loadingMore || !hasMore) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    setLoadingMore(true);
                    setPage(prev => prev + 1);
                    loadPosts(page + 1, true);
                }
            },
            { threshold: 0.5 }
        );
        
        if (lastPostRef.current) {
            observer.observe(lastPostRef.current);
        }
        
        return () => observer.disconnect();
    }, [loading, loadingMore, hasMore, page, loadPosts]);

    const handleLike = async (postId) => {
        try {
            const response = await api.post(`/posts/${postId}/like`);
            setPosts(posts.map(post => 
                post.id === postId 
                    ? { ...post, is_liked: response.data.is_liked, likes_count: response.data.likes_count }
                    : post
            ));
        } catch (error) {
            toast.error('Erreur lors du like');
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(post => post.id !== postId));
            toast.success('Publication supprimée');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setPage(1);
        loadPosts(1, false);
    };

    if (loading && posts.length === 0) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                </div>
                            </div>
                            <div className="h-20 bg-gray-200 rounded mb-4"></div>
                            <div className="flex justify-around">
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Oups ! Une erreur est survenue
                    </h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={handleRetry}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (posts.length === 0 && !loading) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-fadeIn">
                    <div className="text-7xl mb-6">📝</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        Bienvenue sur FriendMobile !
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Votre fil d'actualité est vide pour le moment. 
                        Commencez par ajouter des amis ou créez votre première publication !
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center space-x-2 shadow-md"
                        >
                            <PlusCircleIcon className="h-5 w-5" />
                            <span>Créer une publication</span>
                        </button>
                        <Link 
                            to="/friends"
                            className="border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-50 transition flex items-center justify-center space-x-2"
                        >
                            <UserGroupIcon className="h-5 w-5" />
                            <span>Ajouter des amis</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-2xl mx-auto py-8 px-4">
                {/* Bannière de bienvenue */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Fil d'actualité</h1>
                    <p className="text-indigo-100">
                        Découvrez les dernières publications de vos amis
                    </p>
                </div>
                
                {/* Bouton de création rapide */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 hover:shadow-xl transition-all">
                    <div className="flex items-center space-x-3">
                        <img 
                            src={getAvatarUrl()} 
                            alt={user?.name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex-1 text-left text-gray-500 bg-gray-100 rounded-full px-5 py-3 hover:bg-gray-200 transition"
                        >
                            Quoi de neuf, {user?.name?.split(' ')[0]} ?
                        </button>
                    </div>
                </div>
                
                {/* Liste des posts */}
                <div className="space-y-6">
                    {posts.map((post, index) => (
                        <div
                            key={post.id}
                            ref={index === posts.length - 1 ? lastPostRef : null}
                        >
                            <PostCard
                                post={post}
                                onLike={handleLike}
                                onDelete={handleDeletePost}
                            />
                        </div>
                    ))}
                </div>
                
                {/* Indicateur de chargement */}
                {loadingMore && (
                    <div className="text-center py-8">
                        <div className="inline-block loader"></div>
                        <p className="text-gray-500 mt-2">Chargement...</p>
                    </div>
                )}
                
                {/* Message de fin */}
                {!hasMore && posts.length > 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">✨ Vous avez tout vu ! ✨</p>
                    </div>
                )}
            </div>

            {/* Modal de création de post */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Créer une publication
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreatePost} className="p-4 space-y-4">
                            <div className="flex items-center space-x-3">
                                <img 
                                    src={getAvatarUrl()} 
                                    alt={user?.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">{user?.name}</p>
                                    <select
                                        value={privacy}
                                        onChange={(e) => setPrivacy(e.target.value)}
                                        className="text-xs border rounded-full px-2 py-1 bg-gray-50"
                                    >
                                        <option value="public">🌍 Public</option>
                                        <option value="friends">👥 Amis</option>
                                        <option value="private">🔒 Privé</option>
                                    </select>
                                </div>
                            </div>
                            
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Quoi de neuf ?"
                                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows="4"
                                autoFocus
                            />
                            
                            {imagePreview && (
                                <div className="relative">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-full h-48 object-cover rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-500 transition">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer text-gray-500 hover:text-indigo-600"
                                >
                                    <div className="flex flex-col items-center">
                                        <PhotoIcon className="h-8 w-8 mb-2" />
                                        <span className="text-sm">Ajouter une photo</span>
                                    </div>
                                </label>
                            </div>
                            
                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={posting || (!content.trim() && !image)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-md"
                                >
                                    {posting ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="loader w-4 h-4 border-2 border-white border-t-transparent"></div>
                                            <span>Publication...</span>
                                        </div>
                                    ) : (
                                        'Publier'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bouton flottant pour mobile */}
            <div className="fixed bottom-6 right-6 z-40 md:hidden">
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                    <PlusCircleIcon className="h-6 w-6" />
                </button>
            </div>
        </>
    );
}

export default Feed;