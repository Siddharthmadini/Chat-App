import React from 'react';

const EmailInfo = () => {
  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Email Requirements
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>Please use a valid email address from a recognized provider such as:</p>
            <ul className="mt-1 list-disc list-inside">
              <li>Gmail (gmail.com)</li>
              <li>Yahoo (yahoo.com)</li>
              <li>Outlook/Hotmail (outlook.com, hotmail.com)</li>
              <li>iCloud (icloud.com)</li>
              <li>Other legitimate email providers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailInfo;