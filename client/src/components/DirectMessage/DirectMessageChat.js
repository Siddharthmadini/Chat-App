import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const DirectMessageChat = ({ friend, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showClearChat, setShowClearChat] = useState(false);
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

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/direct-messages/${messageId}`);
      setMessages(prev => prev.filter(msg => (msg.id || msg._id) !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
      console.error('Error deleting message:', error);
    }
  };

  const handleClearChat = async () => {
    try {
      await axios.delete(`/api/direct-messages/conversation/${friend._id}`);
      setMessages([]);
      setShowClearChat(false);
      toast.success('Chat cleared');
    } catch (error) {
      toast.error('Failed to clear chat');
      console.error('Error clearing chat:', error);
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
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="mr-3 p-2 text-gray-500 hover:text-gray-700 lg:hidden rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.username}
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
              />
            ) : (
              getAvatarInitials(friend.username)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
              {friend.username}
            </h2>
            <p className="text-xs lg:text-sm text-gray-500 truncate">
              {friend.isOnline ? (
                <span className="text-green-500">● Online</span>
              ) : (
                `Last seen ${new Date(friend.lastSeen).toLocaleDateString()}`
              )}
            </p>
          </div>
        </div>
        
        {/* Clear Chat Button */}
        <div className="relative">
          <button
            onClick={() => setShowClearChat(!showClearChat)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            title="Chat options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          {showClearChat && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
              <button
                onClick={handleClearChat}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 px-4">
              <p className="text-base lg:text-lg">No messages yet</p>
              <p className="text-sm">Start a conversation with {friend.username}!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isOwn = message.sender?.id === user?.id || message.sender?._id === user?.id;
              const showAvatar = index === 0 || 
                (messages[index - 1].sender?.id !== message.sender?.id && 
                 messages[index - 1].sender?._id !== message.sender?._id);
              
              return (
                <div key={message.id || message._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
                  <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs lg:max-w-md relative`}>
                    {/* Avatar - only show for friend's messages */}
                    {showAvatar && !isOwn && (
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium mr-2 flex-shrink-0">
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt={friend.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          getAvatarInitials(friend.username)
                        )}
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div 
                      className={`relative px-3 lg:px-4 py-2 rounded-lg group-hover:shadow-sm transition-shadow ${
                        isOwn 
                          ? 'bg-primary-500 text-white rounded-br-sm' 
                          : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <div className="text-sm break-words">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isOwn ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                      </div>

                      {/* Delete button - only show for own messages on hover */}
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteMessage(message.id || message._id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
                          title="Delete message"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Spacer for alignment when no avatar */}
                    {!showAvatar && !isOwn && <div className="w-10" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-900 px-3 lg:px-4 py-2 rounded-lg">
              <div className="text-sm text-gray-500">
                {friend.username} is typing...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-4 lg:px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onBlur={handleStopTyping}
            placeholder={`Message ${friend.username}...`}
            className="flex-1 px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 lg:px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
          >
            Send
          </button>
        </form>
      </div>

      {/* Clear Chat Overlay */}
      {showClearChat && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowClearChat(false)}
        />
      )}
    </div>
  );
};

export default DirectMessageChat;