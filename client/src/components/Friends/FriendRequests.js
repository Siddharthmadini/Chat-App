import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FriendRequests = ({ onClose }) => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        axios.get('/api/friends/requests/received'),
        axios.get('/api/friends/requests/sent')
      ]);

      setReceivedRequests(receivedRes.data.requests);
      setSentRequests(sentRes.data.requests);
    } catch (error) {
      toast.error('Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      await axios.put(`/api/friends/request/${requestId}`, { action });
      toast.success(`Friend request ${action}ed successfully!`);
      fetchRequests();
    } catch (error) {
      toast.error(`Failed to ${action} friend request`);
    }
  };

  const getAvatarInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-4 lg:p-6 border-b flex-shrink-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Friend Requests</h3>
            <p className="text-sm text-gray-600 mt-1">Manage your incoming and outgoing friend requests</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'received'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span>Received ({receivedRequests.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Sent ({sentRequests.length})</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === 'received' ? (
            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No friend requests</h4>
                  <p className="text-gray-600">You don't have any pending friend requests.</p>
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <div key={request._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                        {request.sender.avatar ? (
                          <img
                            src={request.sender.avatar}
                            alt={request.sender.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          getAvatarInitials(request.sender.username)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{request.sender.username}</p>
                        <p className="text-sm text-gray-500 truncate">Code: {request.sender.userCode}</p>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1 break-words">{request.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 sm:flex-shrink-0">
                      <button
                        onClick={() => handleRequest(request._id, 'accept')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRequest(request._id, 'reject')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No requests sent</h4>
                  <p className="text-gray-600">You haven't sent any friend requests yet.</p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div key={request._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                        {request.receiver.avatar ? (
                          <img
                            src={request.receiver.avatar}
                            alt={request.receiver.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          getAvatarInitials(request.receiver.username)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{request.receiver.username}</p>
                        <p className="text-sm text-gray-500 truncate">Code: {request.receiver.userCode}</p>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1 break-words">{request.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium sm:flex-shrink-0">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Pending</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;