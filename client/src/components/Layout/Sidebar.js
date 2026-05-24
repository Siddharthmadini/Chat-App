import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddFriend from '../Friends/AddFriend';
import FriendRequests from '../Friends/FriendRequests';
import ProfilePage from '../Profile/ProfilePage';
import axios from 'axios';
import toast from 'react-hot-toast';

const Sidebar = ({ onSelectFriend, selectedFriend }) => {
  const { user, logout } = useAuth();
  const [friends, setFriends] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

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

  const getAvatarInitials = (username) => {
    return username?.charAt(0).toUpperCase();
  };

  const copyUserCode = () => {
    navigator.clipboard.writeText(user.userCode);
    toast.success('User code copied to clipboard!');
  };

  return (
    <>
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowProfile(true)}
              className="relative flex-shrink-0 group"
              title="Edit profile"
            >
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {getAvatarInitials(user?.username)}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => setShowProfile(true)}
                className="text-sm font-medium truncate hover:text-primary-300 transition-colors text-left w-full"
              >
                {user?.username}
              </button>
              <button
                onClick={copyUserCode}
                className="text-xs text-gray-400 hover:text-gray-200 truncate cursor-pointer"
                title="Click to copy user code"
              >
                Code: {user?.userCode}
              </button>
            </div>
          </div>
          {user?.bio && (
            <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {user.bio}
            </p>
          )}
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Messages
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRequests(true)}
                className="relative text-gray-400 hover:text-white"
                title="Friend Requests"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowAddFriend(true)}
                className="text-gray-400 hover:text-white"
                title="Add Friend"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-xs text-gray-500">No friends yet</p>
                <p className="text-xs text-gray-600 mt-1">Add friends to start chatting!</p>
              </div>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => onSelectFriend(friend)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center space-x-3 ${
                    selectedFriend?._id === friend._id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-xs font-medium">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username} className="w-8 h-8 rounded-full" />
                      ) : (
                        getAvatarInitials(friend.username)
                      )}
                    </div>
                    {friend.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-gray-800 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{friend.username}</div>
                    <div className="text-xs truncate">
                      {friend.isOnline
                        ? <span className={selectedFriend?._id === friend._id ? 'text-green-300' : 'text-green-400'}>Online</span>
                        : <span className="text-gray-500">Offline</span>
                      }
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {showAddFriend && (
        <AddFriend
          onClose={() => setShowAddFriend(false)}
          onFriendRequestSent={fetchPendingRequests}
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

      {showProfile && (
        <ProfilePage onClose={() => setShowProfile(false)} />
      )}
    </>
  );
};

export default Sidebar;