import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://job-ael6.onrender.com/api/auth/login', credentials);
      const { token } = response.data;

      // Use the login function from auth context
      login(token);

      // Navigate to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Kevalon Technology</title>
        <meta name="description" content="Secure admin login for Kevalon Technology interview system management." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center px-3 sm:px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100">
        <div className="text-center mb-6 sm:mb-8">
          <img
            src="https://www.kevalontechnology.in/assets/logo/Kevalon2.png"
            alt="Kevalon Technology"
            className="h-12 sm:h-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Admin Login</h1>
          <p className="text-sm text-gray-500">Please sign in to access the admin dashboard</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F4C81] text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px]"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Access restricted to authorized personnel only
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;