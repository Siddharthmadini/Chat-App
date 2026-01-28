import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import AddFriend from '../Friends/AddFriend';
import FriendRequests from '../Friends/FriendRequests';
import axios from 'axios';
import toast from 'react-hot-toast';

const Sidebar = ({ onSelectFriend, selectedFriend, currentView, onViewChange, onClose, sidebarWidth }) => {
  const { user, logout } = useAuth();
  const { currentRoom, joinRoom } = useSocket();
  const [friends, setFriends] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const rooms = ['general', 'random', 'tech', 'gaming'];

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const response = await axios.get('/api/friends');
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('/api/friends/requests/received');
      setPendingRequestsCount(response.data.requests.length);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleRoomChange = (room) => {
    if (room !== currentRoom) {
      joinRoom(room);
      onViewChange('rooms');
      onClose && onClose(); // Close sidebar on mobile
    }
  };

  const handleFriendSelect = (friend) => {
    onSelectFriend(friend);
    onViewChange('directMessage');
    onClose && onClose(); // Close sidebar on mobile
  };

  const handleLogout = () => {
    logout();
  };

  const getAvatarInitials = (username) => {
    return username?.charAt(0).toUpperCase();
  };

  const copyUserCode = () => {
    navigator.clipboard.writeText(user.userCode);
    toast.success('User code copied to clipboard!');
  };

  return (
    <>
      <div className="w-full h-full bg-gray-800 text-white flex flex-col relative">
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-sm font-medium">
                  {getAvatarInitials(user?.username)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.username}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyUserCode}
                  className="text-xs text-gray-400 hover:text-gray-200 truncate cursor-pointer block bg-gray-700 px-2 py-1 rounded font-mono"
                  title="Click to copy user code"
                >
                  {user?.userCode}
                </button>
                {sidebarWidth > 320 && (
                  <span className="text-xs text-gray-500">← Share this code</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* Friends Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Friends
              </h3>
            </div>
            
            {/* Friend Management Buttons */}
            <div className="mb-4 space-y-2">
              <button
                onClick={() => setShowAddFriend(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors text-sm font-medium"
                title="Add a new friend using their user code"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {sidebarWidth > 280 && <span>Add Friend</span>}
              </button>
              
              <button
                onClick={() => setShowRequests(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium relative"
                title="View and manage friend requests"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {sidebarWidth > 280 && <span>Friend Requests</span>}
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            </div>
            
            <div className="space-y-1">
              {friends.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4 bg-gray-700 rounded-md">
                  <div className="flex flex-col items-center space-y-2">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="font-medium">No friends yet</p>
                    {sidebarWidth > 300 && (
                      <p className="text-gray-400">Add friends to start chatting!</p>
                    )}
                  </div>
                </div>
              ) : (
                friends.map((friend) => (
                  <button
                    key={friend._id}
                    onClick={() => handleFriendSelect(friend)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center space-x-2 ${
                      selectedFriend?._id === friend._id && currentView === 'directMessage'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.username}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        getAvatarInitials(friend.username)
                      )}
                    </div>
                    {sidebarWidth > 280 && (
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{friend.username}</div>
                        {friend.isOnline && (
                          <div className="text-xs text-green-400">● Online</div>
                        )}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Rooms Section */}
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {sidebarWidth > 280 ? 'Channels' : 'Rooms'}
            </h3>
            <div className="space-y-1">
              {rooms.map((room) => (
                <button
                  key={room}
                  onClick={() => handleRoomChange(room)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center ${
                    currentRoom === room && currentView === 'rooms'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-2">#</span>
                  {sidebarWidth > 280 ? room : room.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarWidth > 280 && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddFriend && (
        <AddFriend
          onClose={() => setShowAddFriend(false)}
          onFriendRequestSent={() => {
            fetchPendingRequests();
          }}
        />
      )}

      {showRequests && (
        <FriendRequests
          onClose={() => {
            setShowRequests(false);
            fetchFriends();
            fetchPendingRequests();
          }}
        />
      )}
    </>
  );
};

export default Sidebar;