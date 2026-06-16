import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { requestFCMToken, onMessageListener } from '../../firebase';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const FCMInitializer = () => {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const registerToken = async () => {
      if (user && user.userId) {
        const token = await requestFCMToken();
        if (token) {
          try {
            await api.post('/fcm/token', { token });
            console.log('FCM Token registered with backend');
          } catch (err) {
            console.error('Failed to register FCM token', err);
          }
        }
      }
    };

    registerToken();
  }, [user]);

  useEffect(() => {
    // Listen for foreground messages
    const listen = async () => {
      try {
        const payload = await onMessageListener();
        if (payload) {
          toast.success(`${payload.notification.title}: ${payload.notification.body}`, {
            icon: '📱',
            duration: 6000
          });
          // Set up listener again
          listen();
        }
      } catch (err) {
        console.error('FCM Message error', err);
      }
    };
    
    listen();
  }, []);

  return null;
};

export default FCMInitializer;
