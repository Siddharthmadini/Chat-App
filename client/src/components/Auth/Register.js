import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import EmailInfo from './EmailInfo';
import PasswordStrength from './PasswordStrength';

const Register = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && password.length >= 8;
  const validateUsername = (username) =>
    username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    else if (!validateUsername(formData.username)) newErrors.username = 'Username must be 3-20 characters, letters, numbers, underscores only';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const result = await register(formData.username, formData.email, formData.password);
    if (result.success) {
      toast.success('Registration successful!');
    } else {
      if (result.error?.includes('email')) setErrors({ email: result.error });
      else if (result.error?.includes('username')) setErrors({ username: result.error });
      else if (result.error?.includes('password')) setErrors({ password: result.error });
      else toast.error(result.error || 'Registration failed');
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 border ${errors[field] ? 'border-gray-900' : 'border-gray-300'} rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo / Title */}
        <div className="text-center">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Already have an account?{' '}
            <button onClick={onToggleMode} className="font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-600">
              Sign in
            </button>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input id="username" name="username" type="text" required
              className={inputClass('username')}
              placeholder="3-20 characters, letters, numbers, underscores"
              value={formData.username} onChange={handleChange}
            />
            {errors.username && <p className="mt-1 text-xs text-gray-600">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input id="email" name="email" type="email" required
              className={inputClass('email')}
              placeholder="you@example.com"
              value={formData.email} onChange={handleChange}
            />
            {errors.email && <p className="mt-1 text-xs text-gray-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password" name="password" type="password" required
              className={inputClass('password')}
              placeholder="Min 8 chars, uppercase, lowercase, number"
              value={formData.password} onChange={handleChange}
            />
            {errors.password && <p className="mt-1 text-xs text-gray-600">{errors.password}</p>}
            <PasswordStrength password={formData.password} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required
              className={inputClass('confirmPassword')}
              placeholder="Confirm your password"
              value={formData.confirmPassword} onChange={handleChange}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-gray-600">{errors.confirmPassword}</p>}
          </div>

          <EmailInfo />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
