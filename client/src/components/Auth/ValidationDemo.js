import React, { useState } from 'react';

const ValidationDemo = () => {
  const [testEmail, setTestEmail] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Invalid email format' };
    }

    const allowedDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'protonmail.com', 'aol.com', 'live.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    const isValidDomain = allowedDomains.includes(domain) || 
                         /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain);

    if (!isValidDomain) {
      return { valid: false, message: 'Please use a recognized email provider' };
    }

    return { valid: true, message: 'Valid email address' };
  };

  const handleTest = () => {
    const result = validateEmail(testEmail);
    setValidationResult(result);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Email Validation Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Email Address
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <button
          onClick={handleTest}
          className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          Test Email
        </button>
        
        {validationResult && (
          <div className={`p-3 rounded-md ${
            validationResult.valid 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {validationResult.valid ? '✅' : '❌'}
              </span>
              {validationResult.message}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium mb-2">Try these examples:</p>
        <ul className="space-y-1">
          <li>✅ user@gmail.com</li>
          <li>✅ test@yahoo.com</li>
          <li>✅ example@outlook.com</li>
          <li>❌ invalid-email</li>
          <li>❌ user@tempmail.com</li>
        </ul>
      </div>
    </div>
  );
};

export default ValidationDemo;