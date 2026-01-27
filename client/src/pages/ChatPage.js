import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import ChatRoom from '../components/Chat/ChatRoom';
import DirectMessageChat from '../components/DirectMessage/DirectMessageChat';

const ChatPage = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [currentView, setCurrentView] = useState('rooms'); // 'rooms' or 'directMessage'
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setShowSidebar(false); // Hide sidebar on mobile when selecting friend
  };

  const handleBackToRooms = () => {
    setCurrentView('rooms');
    setSelectedFriend(null);
    setShowSidebar(false);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setShowSidebar(false); // Hide sidebar on mobile when changing view
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="h-screen flex bg-gray-100 relative">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {currentView === 'directMessage' && selectedFriend 
            ? selectedFriend.username 
            : currentView === 'rooms' 
            ? 'Chat Rooms' 
            : 'Chat App'
          }
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Sidebar - Desktop: always visible, Mobile: overlay */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto
        fixed inset-y-0 left-0 z-40 w-64 
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          onSelectFriend={handleSelectFriend}
          selectedFriend={selectedFriend}
          currentView={currentView}
          onViewChange={handleViewChange}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16 lg:pt-0">
        {currentView === 'directMessage' && selectedFriend ? (
          <DirectMessageChat 
            friend={selectedFriend} 
            onBack={handleBackToRooms}
          />
        ) : (
          <ChatRoom />
        )}
      </div>
    </div>
  );
};

export default ChatPage;