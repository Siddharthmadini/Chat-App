import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const DirectMessageChat = ({ friend, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/direct-messages/${friend._id}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [friend._id]);

  useEffect(() => {
    if (socket) {
      // Join user room for direct messages
      socket.emit('joinUserRoom');

      // Listen for new direct messages
      socket.on('newDirectMessage', (message) => {
        if (message.sender.id === friend._id || message.receiver.id === friend._id) {
          setMessages(prev => [...prev, message]);
        }
      });

      // Listen for direct message confirmation
      socket.on('directMessageSent', (message) => {
        if (message.receiver.id === friend._id) {
          setMessages(prev => [...prev, message]);
        }
      });

      // Listen for typing indicators
      socket.on('userDirectTyping', (data) => {
        if (data.senderId === friend._id) {
          setIsTyping(data.isTyping);
          if (data.isTyping) {
            setTimeout(() => setIsTyping(false), 3000);
          }
        }
      });

      return () => {
        socket.off('newDirectMessage');
        socket.off('directMessageSent');
        socket.off('userDirectTyping');
      };
    }
  }, [socket, friend._id]);



  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('sendDirectMessage', {
        content: newMessage.trim(),
        receiverId: friend._id
      });
      setNewMessage('');
      handleStopTyping();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket) {
      socket.emit('directTyping', {
        receiverId: friend._id,
        isTyping: true
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping();
      }, 1000);
    }
  };

  const handleStopTyping = () => {
    if (socket) {
      socket.emit('directTyping', {
        receiverId: friend._id,
        isTyping: false
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center">
        <button
          onClick={onBack}
          className="mr-4 text-gray-500 hover:text-gray-700 lg:hidden"
        >
          ←
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              getAvatarInitials(friend.username)
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {friend.username}
            </h2>
            <p className="text-sm text-gray-500">
              {friend.isOnline ? (
                <span className="text-green-500">● Online</span>
              ) : (
                `Last seen ${new Date(friend.lastSeen).toLocaleDateString()}`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start a conversation with {friend.username}!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender.id === user.id;
            return (
              <div key={message.id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs lg:max-w-md`}>
                  <div className={`px-4 py-2 rounded-lg ${
                    isOwn 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    <div className="text-sm">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <div className="text-sm text-gray-500">
                {friend.username} is typing...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onBlur={handleStopTyping}
            placeholder={`Message ${friend.username}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectMessageChat;