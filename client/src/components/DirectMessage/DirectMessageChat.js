import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DirectMessageChat = ({ friend, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [showStarred, setShowStarred] = useState(false);
  const [starredMessages, setStarredMessages] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target) && !e.target.closest('[data-emoji-btn]')) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        if (String(message.sender.id) === String(friend._id) || String(message.receiver.id) === String(friend._id)) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('directMessageSent', (message) => {
        if (String(message.receiver.id) === String(friend._id)) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('messageDeleted', ({ messageId }) => {
        setMessages(prev => prev.map(m =>
          String(m.id) === String(messageId) ? { ...m, isDeleted: true, content: null } : m
        ));
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
        socket.off('messageDeleted');
        socket.off('userDirectTyping');
      };
    }
  }, [socket, friend._id]);


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('sendDirectMessage', {
        content: newMessage.trim(),
        receiverId: friend._id,
        replyToId: replyTo?.id || null
      });
      setNewMessage('');
      setReplyTo(null);
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

  const handleDelete = async (message) => {
    // Optimistically update UI immediately
    setMessages(prev => prev.map(m =>
      String(m.id) === String(message.id) ? { ...m, isDeleted: true, content: null } : m
    ));
    if (socket) {
      socket.emit('deleteDirectMessage', { messageId: message.id, receiverId: friend._id });
    } else {
      try {
        await axios.delete(`/api/direct-messages/${message.id}`);
      } catch {
        // Revert on failure
        setMessages(prev => prev.map(m =>
          String(m.id) === String(message.id) ? { ...m, isDeleted: false, content: message.content } : m
        ));
        toast.error('Failed to delete message');
      }
    }
  };

  const handleStar = async (message) => {
    try {
      const res = await axios.put(`/api/direct-messages/${message.id}/star`);
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, isStarred: res.data.isStarred } : m));
    } catch { toast.error('Failed to star message'); }
  };

  const handleViewStarred = async () => {
    try {
      const res = await axios.get('/api/direct-messages/starred/all');
      const filtered = res.data.messages.filter(m =>
        (String(m.sender.id) === String(friend._id) || String(m.receiver.id) === String(friend._id))
      );
      setStarredMessages(filtered);
      setShowStarred(true);
    } catch { toast.error('Failed to load starred messages'); }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const updated = newMessage.slice(0, start) + emoji + newMessage.slice(end);
      setNewMessage(updated);
      setTimeout(() => { input.focus(); input.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
    } else {
      setNewMessage(prev => prev + emoji);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const getAvatarInitials = (username) => username?.charAt(0).toUpperCase();

  const currentUserId = String(user?.id || user?._id);


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
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 text-gray-400 hover:text-gray-700 lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm overflow-hidden flex-shrink-0">
              {friend.avatar
                ? <img src={friend.avatar} alt={friend.username} className="w-9 h-9 rounded-full object-cover" />
                : getAvatarInitials(friend.username)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{friend.username}</h2>
              <p className="text-xs text-gray-400">
                {friend.isOnline
                  ? <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full inline-block"></span><span>Online</span></span>
                  : `Last seen ${new Date(friend.lastSeen).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        </div>
        {/* Starred messages button */}
        <button
          onClick={handleViewStarred}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="View starred messages"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span>Starred</span>
        </button>
      </div>


      {/* Starred Messages Panel */}
      {showStarred && (
        <div className="absolute inset-0 bg-white z-40 flex flex-col" style={{left: '256px'}}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Starred Messages</h3>
            <button onClick={() => setShowStarred(false)} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {starredMessages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10">No starred messages in this conversation</div>
            ) : (
              starredMessages.map(m => (
                <div key={m.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{m.sender.username}</span>
                    <span className="text-xs text-gray-400">{formatTime(m.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-800">{m.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}


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
            const senderId = String(message.sender.id || message.sender._id);
            const isOwn = senderId === currentUserId;
            const prevMessage = messages[index - 1];
            const prevSenderId = prevMessage ? String(prevMessage.sender.id || prevMessage.sender._id) : null;
            const showAvatar = !isOwn && (!prevMessage || prevSenderId !== senderId);

            return (
              <div
                key={message.id || index}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2 group`}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {!isOwn && (
                  <div className="w-6 h-6 flex-shrink-0 mb-5">
                    {showAvatar ? (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 overflow-hidden">
                        {friend.avatar
                          ? <img src={friend.avatar} alt={friend.username} className="w-6 h-6 rounded-full object-cover" />
                          : getAvatarInitials(friend.username)}
                      </div>
                    ) : <div className="w-6 h-6" />}
                  </div>
                )}

                <div className="flex flex-col max-w-xs lg:max-w-md xl:max-w-lg">
                  {/* Reply preview */}
                  {message.replyTo && !message.isDeleted && (
                    <div className={`mb-1 px-3 py-1.5 rounded-lg border-l-2 border-gray-400 bg-gray-100 text-xs text-gray-500 ${isOwn ? 'self-end' : 'self-start'}`}>
                      <span className="font-semibold text-gray-600">{message.replyTo.sender?.username}</span>
                      <p className="truncate max-w-xs">{message.replyTo.isDeleted ? 'Message deleted' : message.replyTo.content}</p>
                    </div>
                  )}

                  <div className={`px-3.5 py-2 rounded-2xl text-sm ${
                    message.isDeleted
                      ? 'bg-gray-100 text-gray-400 italic border border-gray-200'
                      : isOwn
                        ? 'bg-gray-900 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  }`}>
                    {message.isDeleted ? 'This message was deleted' : message.content}
                  </div>

                  <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
                    {message.isStarred && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Action buttons — show on hover */}
                {!message.isDeleted && hoveredMessageId === message.id && (
                  <div className={`flex items-center space-x-1 mb-5 ${isOwn ? 'order-first mr-1' : 'ml-1'}`}>
                    {/* Reply */}
                    <button
                      onClick={() => { setReplyTo(message); inputRef.current?.focus(); }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-400 shadow-sm transition-colors"
                      title="Reply"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                    {/* Star */}
                    <button
                      onClick={() => handleStar(message)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full bg-white border shadow-sm transition-colors ${message.isStarred ? 'border-gray-400 text-gray-700' : 'border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-400'}`}
                      title={message.isStarred ? 'Unstar' : 'Star'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill={message.isStarred ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    {/* Delete (own messages only) */}
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(message)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-400 shadow-sm transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-end space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 overflow-hidden flex-shrink-0">
              {friend.avatar ? <img src={friend.avatar} alt={friend.username} className="w-6 h-6 rounded-full object-cover" /> : getAvatarInitials(friend.username)}
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
        {/* Reply preview bar */}
        {replyTo && (
          <div className="flex items-center justify-between mb-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-0.5 h-8 bg-gray-400 rounded-full flex-shrink-0"></div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-600">{replyTo.sender?.username || 'You'}</p>
                <p className="text-xs text-gray-400 truncate">{replyTo.content}</p>
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="relative">
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" skinTonesDisabled searchPlaceholder="Search emoji..." width={320} height={400} previewConfig={{ showPreview: false }} />
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button type="button" data-emoji-btn="true" onClick={() => setShowEmojiPicker(prev => !prev)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${showEmojiPicker ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title="Emoji">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <input ref={inputRef} type="text" value={newMessage} onChange={handleInputChange} onBlur={handleStopTyping}
              placeholder={replyTo ? `Replying to ${replyTo.sender?.username || 'message'}...` : `Message ${friend.username}...`}
              className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />

            <button type="submit" disabled={!newMessage.trim()}
              className="w-10 h-10 bg-gray-900 hover:bg-black text-white rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DirectMessageChat;
