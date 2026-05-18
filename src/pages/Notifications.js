// src/pages/Notifications.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Bell, CheckCheck, UserPlus, Heart, MessageSquare } from 'lucide-react';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur de chargement des notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('Toutes les notifications ont été marquées comme lues');
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du marquage');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'friend_request':
                return <UserPlus className="h-5 w-5 text-green-500" />;
            case 'like':
                return <Heart className="h-5 w-5 text-red-500" />;
            case 'comment':
                return <MessageSquare className="h-5 w-5 text-blue-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationLink = (notification) => {
        if (notification.type === 'friend_request') {
            return `/profile/${notification.sender_id}`;
        }
        if (notification.type === 'like' || notification.type === 'comment') {
            return `/post/${notification.post_id}`;
        }
        return '#';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6" />
                        Notifications
                    </h1>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Tout marquer comme lu
                        </button>
                    )}
                </div>

                <div className="divide-y">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Aucune notification pour le moment</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <Link
                                key={notification.id}
                                to={getNotificationLink(notification)}
                                onClick={() => markAsRead(notification.id)}
                                className={`block p-4 hover:bg-gray-50 transition ${
                                    !notification.read ? 'bg-indigo-50' : ''
                                }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={notification.sender?.avatar ? 
                                                `${process.env.REACT_APP_STORAGE_URL}/${notification.sender.avatar}` :
                                                `https://ui-avatars.com/api/?name=${notification.sender?.name || 'User'}&background=6366f1&color=fff`
                                            }
                                            alt={notification.sender?.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">
                                            <span className="font-semibold">{notification.sender?.name}</span>
                                            {' '}{notification.content}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(notification.created_at).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Notifications;