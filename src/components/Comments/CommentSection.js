import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// Supprimer toast qui n'est pas utilisé
import TimeAgo from 'react-timeago';

function CommentSection({ comments, onAddComment, loading }) {
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        setSubmitting(true);
        await onAddComment(newComment);
        setNewComment('');
        setSubmitting(false);
    };

    const getAvatarUrl = (avatar, name) => {
        if (avatar) {
            return `${process.env.REACT_APP_STORAGE_URL}/${avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`;
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Chargement des commentaires...</div>;
    }

    return (
        <div className="border-t border-gray-100 p-4">
            {/* Formulaire d'ajout de commentaire */}
            <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
                <img
                    src={getAvatarUrl(user?.avatar, user?.name)}
                    alt={user?.name}
                    className="h-8 w-8 rounded-full object-cover"
                />
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    {submitting ? '...' : 'Envoyer'}
                </button>
            </form>
            
            {/* Liste des commentaires */}
            {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aucun commentaire</p>
            ) : (
                <div className="space-y-3">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex space-x-3">
                            <img
                                src={getAvatarUrl(comment.user?.avatar, comment.user?.name)}
                                alt={comment.user?.name}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-sm">{comment.user?.name}</span>
                                    <span className="text-xs text-gray-500">
                                        <TimeAgo date={comment.created_at} />
                                    </span>
                                </div>
                                <p className="text-gray-800 text-sm">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CommentSection;