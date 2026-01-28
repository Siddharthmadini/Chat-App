import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChatRoom = () => {
  const { messages, setMessages, currentRoom, sendMessage } = useSocket();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showClearChat, setShowClearChat] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/messages/${currentRoom}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [currentRoom, setMessages]);

  const handleSendMessage = (content) => {
    sendMessage(content);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => (msg.id || msg._id) !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
      console.error('Error deleting message:', error);
    }
  };

  const handleClearChat = async () => {
    try {
      await axios.delete(`/api/messages/room/${currentRoom}`);
      setMessages([]);
      setShowClearChat(false);
      toast.success('Chat cleared');
    } catch (error) {
      toast.error('Failed to clear chat');
      console.error('Error clearing chat:', error);
    }
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
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            #{currentRoom}
          </h2>
          <p className="text-sm text-gray-500">
            Welcome to #{currentRoom} room
          </p>
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
        <MessageList 
          messages={messages} 
          currentUser={user} 
          onDeleteMessage={handleDeleteMessage}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-4 lg:px-6 py-4">
        <MessageInput onSendMessage={handleSendMessage} />
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

export default ChatRoom;