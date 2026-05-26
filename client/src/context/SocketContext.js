import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 
        (process.env.NODE_ENV === 'production' ? 'https://chat-app-9cti.onrender.com' : 'http://localhost:5000');

      const newSocket = io(SOCKET_URL, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocket(newSocket);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};