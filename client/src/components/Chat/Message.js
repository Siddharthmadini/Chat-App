import React from 'react';

const Message = ({ message, isOwn, showAvatar }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs lg:max-w-md`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium mr-2">
            {message.sender.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              getAvatarInitials(message.sender.username)
            )}
          </div>
        )}
        
        {/* Message bubble */}
        <div className={`px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          {/* Username (only for others' messages) */}
          {!isOwn && showAvatar && (
            <div className="text-xs font-medium text-gray-600 mb-1">
              {message.sender.username}
            </div>
          )}
          
          {/* Message content */}
          <div className="text-sm">
            {message.content}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isOwn ? 'text-primary-100' : 'text-gray-500'
          }`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
        
        {/* Spacer for alignment when no avatar */}
        {!showAvatar && !isOwn && <div className="w-10" />}
      </div>
    </div>
  );
};

export default Message;