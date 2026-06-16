import React, { useState, useEffect } from 'react';
import { Check, BellOff, Trash } from 'lucide-react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { motion } from 'framer-motion';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notif) => {
      setNotifications(prev => [notif, ...prev]);
    };
    socket.on('newNotification', handleNewNotification);
    return () => socket.off('newNotification', handleNewNotification);
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=50');
      const items = res.data?.data || res.data || [];
      setNotifications(items);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">Stay updated with your latest alerts</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-lg"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <BellOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No notifications yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            When you receive updates about your bookings or important alerts, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {notifications.map((notif, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={notif._id} 
              className={`p-4 sm:p-5 transition-colors hover:bg-muted/50 cursor-pointer ${!notif.isRead ? 'bg-primary/5' : ''}`}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
            >
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground truncate">{notif.title}</p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-2 font-medium">
                    {new Date(notif.createdAt).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-center ml-2">
                  <button 
                    onClick={(e) => deleteNotification(e, notif._id)} 
                    className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                    title="Delete notification"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
