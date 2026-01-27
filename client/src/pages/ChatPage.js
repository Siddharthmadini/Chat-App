import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import ChatRoom from '../components/Chat/ChatRoom';
import DirectMessageChat from '../components/DirectMessage/DirectMessageChat';

const ChatPage = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [currentView, setCurrentView] = useState('rooms'); // 'rooms' or 'directMessage'

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };

  const handleBackToRooms = () => {
    setCurrentView('rooms');
    setSelectedFriend(null);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar 
        onSelectFriend={handleSelectFriend}
        selectedFriend={selectedFriend}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      {currentView === 'directMessage' && selectedFriend ? (
        <DirectMessageChat 
          friend={selectedFriend} 
          onBack={handleBackToRooms}
        />
      ) : (
        <ChatRoom />
      )}
    </div>
  );
};

export default ChatPage;