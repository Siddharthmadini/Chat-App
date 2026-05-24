import React from 'react';
import Message from './Message';

const MessageList = ({ messages, currentUser }) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg">No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const isOwn = message.sender.id === currentUser.id;
        const showAvatar = index === 0 || 
          messages[index - 1].sender.id !== message.sender.id;
        
        return (
          <Message
            key={message.id || index}
            message={message}
            isOwn={isOwn}
            showAvatar={showAvatar}
          />
        );
      })}
    </div>
  );
};

export default MessageList;