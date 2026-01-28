import React, { useState } from 'react';

const Message = ({ message, isOwn, showAvatar, onDeleteMessage }) => {
  const [showOptions, setShowOptions] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  const handleDeleteMessage = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id || message._id);
    }
    setShowOptions(false);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs lg:max-w-md relative`}>
        {/* Avatar - only show for others' messages */}
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium mr-2 flex-shrink-0">
            {message.sender?.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              getAvatarInitials(message.sender?.username || 'U')
            )}
          </div>
        )}
        
        {/* Message bubble */}
        <div 
          className={`relative px-4 py-2 rounded-lg ${
            isOwn 
              ? 'bg-primary-500 text-white rounded-br-sm' 
              : 'bg-gray-200 text-gray-900 rounded-bl-sm'
          }`}
          onMouseEnter={() => setShowOptions(true)}
          onMouseLeave={() => setShowOptions(false)}
        >
          {/* Username (only for others' messages) */}
          {!isOwn && showAvatar && (
            <div className="text-xs font-medium text-gray-600 mb-1">
              {message.sender?.username || 'Unknown'}
            </div>
          )}
          
          {/* Message content */}
          <div className="text-sm break-words">
            {message.content}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isOwn ? 'text-primary-100' : 'text-gray-500'
          }`}>
            {formatTime(message.createdAt)}
          </div>

          {/* Message options (delete) - only show for own messages */}
          {isOwn && showOptions && (
            <div className="absolute -top-8 right-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
              <button
                onClick={handleDeleteMessage}
                className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        {/* Spacer for alignment when no avatar */}
        {!showAvatar && !isOwn && <div className="w-10" />}
      </div>
    </div>
  );
};

export default Message;