import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import axios from 'axios';

const ChatRoom = () => {
  const { messages, setMessages, currentRoom, sendMessage } = useSocket();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
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
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          #{currentRoom}
        </h2>
        <p className="text-sm text-gray-500">
          Welcome to #{currentRoom} room
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4 scrollbar-thin">
        <MessageList messages={messages} currentUser={user} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-4 lg:px-6 py-4">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatRoom;