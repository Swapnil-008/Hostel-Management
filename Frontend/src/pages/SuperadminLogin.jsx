import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SuperadminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect URL from query param or default to /superadmin-dashboard
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('redirect') || '/superadmin-dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Superadmin login request:', { username, password });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login/superadmin', {
        username,
        password,
      });
      console.log('API Response:', res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      console.log('User in localStorage:', localStorage.getItem('user'));
      alert('Superadmin logged in successfully!');
      navigate(redirectTo);
    } catch (err) {
      console.error('Login Error:', err.response?.data?.error || err.message);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Superadmin Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <label className="block text-blue-900 font-medium mb-2">Username</label>
              <div className="flex items-center">
                <FaUser className="absolute left-3 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>
            <div className="mb-6 relative">
              <label className="block text-blue-900 font-medium mb-2">Password</label>
              <div className="flex items-center">
                <FaLock className="absolute left-3 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="button">
                Login
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuperadminLogin;