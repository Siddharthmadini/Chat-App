import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import DirectMessageChat from '../components/DirectMessage/DirectMessageChat';

const ChatPage = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);

  return (
    <div className="h-screen flex bg-white">
      <Sidebar onSelectFriend={setSelectedFriend} selectedFriend={selectedFriend} />

      {selectedFriend ? (
        <DirectMessageChat friend={selectedFriend} onBack={() => setSelectedFriend(null)} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Select a conversation</p>
            <p className="text-xs text-gray-400 mt-1">Choose a friend from the sidebar to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
