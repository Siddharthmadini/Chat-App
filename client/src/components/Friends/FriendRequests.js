import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FriendRequests = ({ onClose }) => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

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
      toast.success(`Request ${action}ed`);
      fetchRequests();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const getAvatarInitials = (username) => username.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Friend Requests</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {['received', 'sent'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'received' ? `Received (${receivedRequests.length})` : `Sent (${sentRequests.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'received' ? (
            receivedRequests.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10">No requests received</div>
            ) : (
              receivedRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm overflow-hidden flex-shrink-0">
                      {request.sender.avatar
                        ? <img src={request.sender.avatar} alt={request.sender.username} className="w-10 h-10 rounded-full object-cover" />
                        : getAvatarInitials(request.sender.username)
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{request.sender.username}</p>
                      <p className="text-xs text-gray-400 font-mono">{request.sender.userCode}</p>
                      {request.message && <p className="text-xs text-gray-500 mt-0.5 italic">"{request.message}"</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleRequest(request._id, 'accept')}
                      className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequest(request._id, 'reject')}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            sentRequests.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10">No requests sent</div>
            ) : (
              sentRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm overflow-hidden flex-shrink-0">
                      {request.receiver.avatar
                        ? <img src={request.receiver.avatar} alt={request.receiver.username} className="w-10 h-10 rounded-full object-cover" />
                        : getAvatarInitials(request.receiver.username)
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{request.receiver.username}</p>
                      <p className="text-xs text-gray-400 font-mono">{request.receiver.userCode}</p>
                      {request.message && <p className="text-xs text-gray-500 mt-0.5 italic">"{request.message}"</p>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2.5 py-1 rounded-full">Pending</span>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;
