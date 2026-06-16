import React, { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';

const SocketListener = () => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      toast.success(`${notif.title}: ${notif.message}`, {
        icon: notif.type === 'system' ? '📢' : '🔔',
        duration: 6000
      });
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]);

  return null;
};

export default SocketListener;
