import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const MAX_WORDS = 60;

const countWords = (text) => {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
};

const ProfilePage = ({ onClose }) => {
  const { user, dispatch } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [preview, setPreview] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const wordCount = countWords(bio);
  const wordsLeft = MAX_WORDS - wordCount;
  const isOverLimit = wordCount > MAX_WORDS;

  useEffect(() => {
    setAvatar(user?.avatar || '');
    setPreview(user?.avatar || '');
    setBio(user?.bio || '');
  }, [user]);

  const handleImageFile = (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) { toast.error('Please upload a JPEG, PNG, GIF, or WebP image'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be smaller than 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setAvatar(reader.result); setPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => handleImageFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleRemoveAvatar = () => { setAvatar(''); setPreview(''); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverLimit) { toast.error(`Bio must be ${MAX_WORDS} words or less`); return; }
    try {
      setLoading(true);
      const response = await axios.put('/api/profile', { avatar, bio });
      dispatch({ type: 'UPDATE_PROFILE', payload: response.data.user });
      toast.success('Profile updated!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (username) => username?.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div
                className={`w-24 h-24 rounded-full overflow-hidden border-4 cursor-pointer transition-all ${
                  dragOver ? 'border-gray-900 scale-105' : 'border-gray-200'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 text-3xl font-bold">
                    {getInitials(user?.username)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 hover:bg-black rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFileChange} className="hidden" />

            <div className="flex items-center space-x-3 text-sm">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-700 font-medium hover:text-gray-900 underline underline-offset-2">
                Upload photo
              </button>
              {preview && (
                <>
                  <span className="text-gray-300">·</span>
                  <button type="button" onClick={handleRemoveAvatar} className="text-gray-400 hover:text-gray-600 underline underline-offset-2">
                    Remove
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400">JPEG, PNG, GIF or WebP · Max 2MB</p>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Username</label>
            <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
              {user?.username}
            </div>
          </div>

          {/* User Code */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">User Code</label>
            <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm font-mono">
              {user?.userCode}
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</label>
              <span className={`text-xs font-medium ${isOverLimit ? 'text-gray-900' : wordsLeft <= 10 ? 'text-gray-500' : 'text-gray-400'}`}>
                {wordCount}/{MAX_WORDS} words
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a little about yourself..."
              rows={4}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
                isOverLimit ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
              }`}
            />
            {isOverLimit && (
              <p className="mt-1 text-xs text-gray-600">Please shorten your bio to {MAX_WORDS} words or less</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isOverLimit}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
