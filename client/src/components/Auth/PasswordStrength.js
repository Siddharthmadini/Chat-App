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
  const strengthColor = passedCount === 4 ? 'text-gray-900' : passedCount >= 2 ? 'text-gray-600' : 'text-gray-400';

  if (!password) return null;

  return (
    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">Password strength</span>
        <span className={`text-xs font-semibold ${strengthColor}`}>{strength}</span>
      </div>
      {/* Strength bar */}
      <div className="flex space-x-1 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= passedCount ? 'bg-gray-900' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-xs">
            <span className={`mr-2 font-bold ${req.test ? 'text-gray-900' : 'text-gray-300'}`}>
              {req.test ? '✓' : '·'}
            </span>
            <span className={req.test ? 'text-gray-700' : 'text-gray-400'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
