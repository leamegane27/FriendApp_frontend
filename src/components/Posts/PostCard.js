import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import TimeAgo from 'react-timeago';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import CommentSection from '../Comments/CommentSection';

function PostCard({ post, onLike, onDelete }) {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
    const [loadingComments, setLoadingComments] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [isLiked, setIsLiked] = useState(post.is_liked || false);
    const [showMenu, setShowMenu] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const getAvatarUrl = (avatar, name) => {
        if (avatar) {
            return `${process.env.REACT_APP_STORAGE_URL}/${avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
    };

    const getImageUrl = (image) => {
        if (image) {
            return `${process.env.REACT_APP_STORAGE_URL}/${image}`;
        }
        return null;
    };

    const handleLike = async () => {
        try {
            const response = await api.post(`/posts/${post.id}/like`);
            setIsLiked(response.data.is_liked);
            setLikesCount(response.data.likes_count);
            if (onLike) onLike(post.id);
        } catch (error) {
            toast.error('Erreur lors du like');
        }
    };

    const handleLoadComments = async () => {
        if (showComments) {
            setShowComments(false);
            return;
        }
        
        setLoadingComments(true);
        try {
            const response = await api.get(`/posts/${post.id}/comments`);
            setComments(response.data.data.data || []);
            setShowComments(true);
        } catch (error) {
            toast.error('Erreur lors du chargement des commentaires');
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async (content) => {
        try {
            const response = await api.post(`/comments/posts/${post.id}`, { content });
            setComments([response.data.comment, ...comments]);
            setCommentsCount(prev => prev + 1);
            toast.success('Commentaire ajouté');
        } catch (error) {
            toast.error('Erreur lors de l\'ajout du commentaire');
        }
    };

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
            onDelete && onDelete(post.id);
        }
        setShowMenu(false);
    };

    const imageUrl = getImageUrl(post.image);

    return (
        <div className="post-card bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            {/* En-tête du post */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Link to={`/profile/${post.user.id}`} className="relative">
                        <img
                            src={getAvatarUrl(post.user.avatar, post.user.name)}
                            alt={post.user.name}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-100 hover:ring-indigo-300 transition-all"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </Link>
                    <div>
                        <Link 
                            to={`/profile/${post.user.id}`} 
                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-base"
                        >
                            {post.user.name}
                        </Link>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                            <TimeAgo date={post.created_at} />
                            <span>•</span>
                            <span className="capitalize flex items-center">
                                {post.privacy === 'public' && (
                                    <>
                                        <span className="mr-1">🌍</span>
                                        Public
                                    </>
                                )}
                                {post.privacy === 'friends' && (
                                    <>
                                        <span className="mr-1">👥</span>
                                        Amis
                                    </>
                                )}
                                {post.privacy === 'private' && (
                                    <>
                                        <span className="mr-1">🔒</span>
                                        Privé
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Menu des options */}
                {user?.id === post.user_id && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100"
                        >
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 animate-fadeIn">
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                >
                                    Supprimer la publication
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Contenu du post */}
            <div className="px-4 pb-4">
                <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
                    {post.content}
                </p>
                {imageUrl && (
                    <div className="mt-4 rounded-xl overflow-hidden bg-gray-100">
                        {!imageLoaded && (
                            <div className="w-full h-64 flex items-center justify-center">
                                <div className="loader"></div>
                            </div>
                        )}
                        <img
                            src={imageUrl}
                            alt="Post"
                            className={`w-full h-auto max-h-96 object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageLoaded(true)}
                        />
                    </div>
                )}
            </div>
            
            {/* Statistiques (likes & commentaires) */}
            {(likesCount > 0 || commentsCount > 0) && (
                <div className="px-4 py-2 border-t border-gray-100">
                    <div className="flex justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                            {likesCount > 0 && (
                                <div className="flex items-center space-x-1">
                                    <HeartIconSolid className="h-4 w-4 text-red-500" />
                                    <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            {commentsCount > 0 && (
                                <span>{commentsCount} {commentsCount === 1 ? 'commentaire' : 'commentaires'}</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Boutons d'action */}
            <div className="px-2 py-2 border-t border-gray-100 flex justify-around">
                <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                        isLiked 
                            ? 'text-red-500 bg-red-50' 
                            : 'text-gray-600 hover:text-red-500 hover:bg-gray-50'
                    }`}
                >
                    {isLiked ? (
                        <HeartIconSolid className="h-5 w-5" />
                    ) : (
                        <HeartIcon className="h-5 w-5" />
                    )}
                    <span className="text-sm font-medium">J'aime</span>
                </button>
                
                <button
                    onClick={handleLoadComments}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                        showComments 
                            ? 'text-indigo-600 bg-indigo-50' 
                            : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                >
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Commenter</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-all">
                    <ShareIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Partager</span>
                </button>
            </div>
            
            {/* Section des commentaires */}
            {showComments && (
                <div className="border-t border-gray-100 bg-gray-50">
                    <CommentSection
                        comments={comments}
                        onAddComment={handleAddComment}
                        loading={loadingComments}
                        postId={post.id}
                    />
                </div>
            )}
        </div>
    );
}

export default PostCard;