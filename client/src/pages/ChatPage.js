import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import ChatRoom from '../components/Chat/ChatRoom';
import DirectMessageChat from '../components/DirectMessage/DirectMessageChat';
import useResizable from '../hooks/useResizable';

const ChatPage = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [currentView, setCurrentView] = useState('rooms'); // 'rooms' or 'directMessage'
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle
  const { width: sidebarWidth, startResizing, isResizing } = useResizable(350, 240, 450);

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
    <div className={`h-screen flex bg-gray-100 relative ${isResizing ? 'cursor-col-resize' : ''}`}>
      {/* Global resize cursor overlay */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" style={{ pointerEvents: 'none' }} />
      )}
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

      {/* Sidebar - Desktop: resizable, Mobile: overlay */}
      <div 
        className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-auto
          fixed inset-y-0 left-0 z-40 
          transition-transform duration-300 ease-in-out lg:transition-none
          ${isResizing ? 'select-none transition-none' : 'lg:transition-all lg:duration-150'}
        `}
        style={{ width: `${sidebarWidth}px` }}
      >
        <Sidebar 
          onSelectFriend={handleSelectFriend}
          selectedFriend={selectedFriend}
          currentView={currentView}
          onViewChange={handleViewChange}
          onClose={() => setShowSidebar(false)}
          sidebarWidth={sidebarWidth}
        />
        
        {/* Resize Handle - Only visible on desktop */}
        <div
          className="hidden lg:block absolute top-0 right-0 w-2 h-full cursor-col-resize transition-colors group hover:bg-primary-200"
          onMouseDown={startResizing}
          style={{ 
            background: isResizing 
              ? 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(156, 163, 175, 0.3) 50%, transparent 100%)'
          }}
        >
          {/* Resize grip indicator */}
          <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-12 flex items-center justify-center">
            <div className={`w-1 h-8 rounded-full transition-all duration-200 ${
              isResizing 
                ? 'bg-primary-500 shadow-lg' 
                : 'bg-gray-400 group-hover:bg-primary-400 opacity-60 group-hover:opacity-100'
            }`}>
              <div className="w-full h-full flex flex-col justify-center items-center space-y-0.5">
                <div className="w-0.5 h-1 bg-white rounded-full opacity-80"></div>
                <div className="w-0.5 h-1 bg-white rounded-full opacity-80"></div>
                <div className="w-0.5 h-1 bg-white rounded-full opacity-80"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16 lg:pt-0 min-w-0">
        {currentView === 'directMessage' && selectedFriend ? (
          <DirectMessageChat 
            friend={selectedFriend} 
            onBack={handleBackToRooms}
          />
        ) : (
          <ChatRoom />
        )}
      </div>

      {/* Resize Indicator */}
      {isResizing && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg border border-gray-600">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
            <span>Sidebar Width: <span className="font-mono text-primary-300">{sidebarWidth}px</span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;