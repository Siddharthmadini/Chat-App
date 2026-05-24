import React from 'react';

const EmailInfo = () => {
  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex space-x-2">
        <svg className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-xs font-medium text-gray-700">Accepted email providers</p>
          <p className="text-xs text-gray-500 mt-0.5">Gmail, Yahoo, Outlook, Hotmail, iCloud, and other legitimate providers.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailInfo;
