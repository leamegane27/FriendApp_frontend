// src/pages/Messages.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Send, MessageSquare } from 'lucide-react';

function Messages() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Charger les conversations
    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadConversations = async () => {
        try {
            const response = await api.get('/conversations');
            // Gestion robuste des données
            let conversationsData = [];
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    conversationsData = response.data;
                } else if (Array.isArray(response.data.data)) {
                    conversationsData = response.data.data;
                } else if (response.data.conversations && Array.isArray(response.data.conversations)) {
                    conversationsData = response.data.conversations;
                }
            }
            
            setConversations(conversationsData);
        } catch (error) {
            console.error('Erreur chargement conversations:', error);
            // Ne pas afficher d'erreur pour 404 car c'est normal si pas de conversations
            if (error.response?.status !== 404) {
                toast.error('Erreur de chargement des conversations');
            }
            setConversations([]);
        }
    };

    const loadMessages = async (conversationId) => {
        setLoading(true);
        try {
            const response = await api.get(`/conversations/${conversationId}/messages`);
            let messagesData = [];
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    messagesData = response.data;
                } else if (Array.isArray(response.data.data)) {
                    messagesData = response.data.data;
                } else if (response.data.messages && Array.isArray(response.data.messages)) {
                    messagesData = response.data.messages;
                }
            }
            
            setMessages(messagesData);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error('Erreur chargement messages:', error);
            if (error.response?.status !== 404) {
                toast.error('Erreur de chargement des messages');
            }
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const selectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        await loadMessages(conversation.id);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            const response = await api.post(`/conversations/${selectedConversation.id}/messages`, {
                content: newMessage
            });
            
            let newMsg = response.data;
            if (response.data.data) {
                newMsg = response.data.data;
            }
            
            setMessages(prev => [...prev, newMsg]);
            setNewMessage('');
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Erreur envoi message:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
        } finally {
            setSending(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Liste des conversations */}
            <div className="w-80 bg-white border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Messages
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>Aucune conversation</p>
                            <p className="text-sm mt-2">Envoyez un message à un ami pour commencer</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => selectConversation(conv)}
                                className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${
                                    selectedConversation?.id === conv.id ? 'bg-indigo-50' : ''
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={conv.user?.avatar ? 
                                            `${process.env.REACT_APP_STORAGE_URL}/${conv.user.avatar}` :
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user?.name || 'User')}&background=6366f1&color=fff`
                                        }
                                        alt={conv.user?.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{conv.user?.name}</p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {conv.last_message?.content || 'Nouvelle conversation'}
                                        </p>
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <span className="bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Zone de chat */}
            <div className="flex-1 flex flex-col">
                {!selectedConversation ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700">Sélectionnez une conversation</h3>
                            <p className="text-gray-500 mt-2">Choisissez un ami pour commencer à discuter</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* En-tête */}
                        <div className="bg-white border-b p-4 flex items-center space-x-3">
                            <Link to={`/profile/${selectedConversation.user?.id}`}>
                                <img
                                    src={selectedConversation.user?.avatar ? 
                                        `${process.env.REACT_APP_STORAGE_URL}/${selectedConversation.user.avatar}` :
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.user?.name || 'User')}&background=6366f1&color=fff`
                                    }
                                    alt={selectedConversation.user?.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                            </Link>
                            <div>
                                <Link to={`/profile/${selectedConversation.user?.id}`} className="font-semibold hover:text-indigo-600">
                                    {selectedConversation.user?.name}
                                </Link>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Aucun message</p>
                                    <p className="text-sm mt-2">Soyez le premier à envoyer un message</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, index) => {
                                        const isOwn = msg.user_id === parseInt(localStorage.getItem('userId'));
                                        return (
                                            <div
                                                key={msg.id || index}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900'} rounded-lg p-3 shadow`}>
                                                    <p className="text-sm break-words">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                        {formatDate(msg.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Formulaire d'envoi */}
                        <form onSubmit={sendMessage} className="bg-white border-t p-4">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    {sending ? '...' : 'Envoyer'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default Messages;