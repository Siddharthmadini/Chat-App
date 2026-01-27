import React from 'react';

const PasswordStrength = ({ password }) => {
  const requirements = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'Contains uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Contains number', test: /\d/.test(password) }
  ];

  const passedCount = requirements.filter(req => req.test).length;
  const strength = passedCount === 4 ? 'Strong' : passedCount >= 2 ? 'Medium' : 'Weak';
  const strengthColor = passedCount === 4 ? 'text-green-600' : passedCount >= 2 ? 'text-yellow-600' : 'text-red-600';

  if (!password) return null;

  return (
    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Password Strength:</span>
        <span className={`text-sm font-medium ${strengthColor}`}>{strength}</span>
      </div>
      
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-xs">
            <span className={`mr-2 ${req.test ? 'text-green-500' : 'text-gray-400'}`}>
              {req.test ? '✓' : '○'}
            </span>
            <span className={req.test ? 'text-green-700' : 'text-gray-500'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;