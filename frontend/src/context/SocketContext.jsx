import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only connect if the user is authenticated
    if (user && user.userId) {
      // Connect to the backend socket server
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        transports: ['websocket'],
      });

      setSocket(newSocket);

      // Tell the server who we are so we can join our personal room
      newSocket.emit('join', user.userId);

      // If user is admin, also join the admin room
      if (user.role === 'admin') {
        newSocket.emit('joinAdmin');
      }

      // Cleanup on unmount or logout
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
