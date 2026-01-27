import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import AddFriend from '../Friends/AddFriend';
import FriendRequests from '../Friends/FriendRequests';
import axios from 'axios';
import toast from 'react-hot-toast';

const Sidebar = ({ onSelectFriend, selectedFriend, currentView, onViewChange, onClose }) => {
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
      <div className="w-full h-full bg-gray-800 text-white flex flex-col">
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
        <div className="p-4 border-b border-gray-700">
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
              <button
                onClick={copyUserCode}
                className="text-xs text-gray-400 hover:text-gray-200 truncate cursor-pointer block"
                title="Click to copy user code"
              >
                Code: {user?.userCode}
              </button>
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
              <div className="flex space-x-1">
                <button
                  onClick={() => setShowRequests(true)}
                  className="text-xs text-gray-400 hover:text-white relative"
                  title="Friend Requests"
                >
                  📋
                  {pendingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowAddFriend(true)}
                  className="text-xs text-gray-400 hover:text-white"
                  title="Add Friend"
                >
                  ➕
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              {friends.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-2">
                  No friends yet
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
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs">
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
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{friend.username}</div>
                      {friend.isOnline && (
                        <div className="text-xs text-green-400">● Online</div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Rooms Section */}
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Channels
            </h3>
            <div className="space-y-1">
              {rooms.map((room) => (
                <button
                  key={room}
                  onClick={() => handleRoomChange(room)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    currentRoom === room && currentView === 'rooms'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  # {room}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Sign Out
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