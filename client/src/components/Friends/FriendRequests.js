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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">Friend Requests</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'received'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'sent'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'received' ? (
            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No friend requests received
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
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
                      <div>
                        <p className="font-medium">{request.sender.username}</p>
                        <p className="text-sm text-gray-500">Code: {request.sender.userCode}</p>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequest(request._id, 'accept')}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequest(request._id, 'reject')}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No friend requests sent
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
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
                      <div>
                        <p className="font-medium">{request.receiver.username}</p>
                        <p className="text-sm text-gray-500">Code: {request.receiver.userCode}</p>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-yellow-600 font-medium">
                      Pending
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