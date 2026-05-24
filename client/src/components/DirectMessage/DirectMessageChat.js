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

  useEffect(() => { scrollToBottom(); }, [messages]);

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
      socket.emit('joinUserRoom');

      socket.on('newDirectMessage', (message) => {
        if (message.sender.id === friend._id || message.receiver.id === friend._id) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('directMessageSent', (message) => {
        if (message.receiver.id === friend._id) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('userDirectTyping', (data) => {
        if (data.senderId === friend._id) {
          setIsTyping(data.isTyping);
          if (data.isTyping) setTimeout(() => setIsTyping(false), 3000);
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
      socket.emit('sendDirectMessage', { content: newMessage.trim(), receiverId: friend._id });
      setNewMessage('');
      handleStopTyping();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('directTyping', { receiverId: friend._id, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(handleStopTyping, 1000);
    }
  };

  const handleStopTyping = () => {
    if (socket) socket.emit('directTyping', { receiverId: friend._id, isTyping: false });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const getAvatarInitials = (username) => username.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-gray-400 text-sm">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center">
        <button onClick={onBack} className="mr-4 text-gray-400 hover:text-gray-700 lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm overflow-hidden flex-shrink-0">
            {friend.avatar ? (
              <img src={friend.avatar} alt={friend.username} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              getAvatarInitials(friend.username)
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{friend.username}</h2>
            <p className="text-xs text-gray-400">
              {friend.isOnline ? (
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full inline-block"></span>
                  <span>Online</span>
                </span>
              ) : (
                `Last seen ${new Date(friend.lastSeen).toLocaleDateString()}`
              )}
            </p>
            {friend.bio && (
              <p className="text-xs text-gray-400 mt-0.5 max-w-md truncate">{friend.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scrollbar-thin bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Say hello to {friend.username}!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender.id === user.id;
            const prevMessage = messages[index - 1];
            const showAvatar = !isOwn && (!prevMessage || prevMessage.sender.id !== message.sender.id);

            return (
              <div key={message.id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
                {/* Friend avatar */}
                {!isOwn && (
                  <div className="w-6 h-6 flex-shrink-0 mb-1">
                    {showAvatar ? (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 overflow-hidden">
                        {friend.avatar
                          ? <img src={friend.avatar} alt={friend.username} className="w-6 h-6 rounded-full object-cover" />
                          : getAvatarInitials(friend.username)
                        }
                      </div>
                    ) : <div className="w-6 h-6" />}
                  </div>
                )}

                <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
                  <div className={`px-3.5 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-gray-900 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  }`}>
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 text-gray-400 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 overflow-hidden flex-shrink-0">
              {friend.avatar
                ? <img src={friend.avatar} alt={friend.username} className="w-6 h-6 rounded-full object-cover" />
                : getAvatarInitials(friend.username)
              }
            </div>
            <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onBlur={handleStopTyping}
            placeholder={`Message ${friend.username}...`}
            className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-gray-900 hover:bg-black text-white rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectMessageChat;
