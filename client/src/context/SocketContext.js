import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../config/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocket(newSocket);
      });

      newSocket.on('newMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('userJoined', (data) => {
        console.log(data.message);
      });

      newSocket.on('userLeft', (data) => {
        console.log(data.message);
      });

      newSocket.on('userTyping', (data) => {
        // Handle typing indicators
        console.log(`${data.username} is ${data.isTyping ? 'typing' : 'not typing'}`);
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

  const sendMessage = (content, room = currentRoom) => {
    if (socket && content.trim()) {
      socket.emit('sendMessage', { content, room });
    }
  };

  const joinRoom = (room) => {
    if (socket) {
      socket.emit('joinRoom', room);
      setCurrentRoom(room);
      setMessages([]); // Clear messages when switching rooms
    }
  };

  const startTyping = () => {
    if (socket) {
      socket.emit('typing', { room: currentRoom });
    }
  };

  const stopTyping = () => {
    if (socket) {
      socket.emit('stopTyping', { room: currentRoom });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      messages,
      setMessages,
      currentRoom,
      sendMessage,
      joinRoom,
      startTyping,
      stopTyping
    }}>
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