import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login = ({ role }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect URL from the query parameter (e.g., ?redirect=/community)
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('redirect') || (role === 'student' ? '/dashboard' : '/admin-dashboard');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = role === 'student' ? '/api/auth/login/student' : '/api/auth/login/admin';
      const data = role === 'student' 
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password };
      const res = await axios.post(`http://localhost:5000${endpoint}`, data);
      console.log('API Response:', res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      console.log('User in localStorage:', localStorage.getItem('user'));
      alert(`${role} logged in successfully!`);
      navigate(redirectTo); // Redirect to the intended route
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
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">{role === 'student' ? 'Student' : 'Admin'} Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <label className="block text-blue-900 font-medium mb-2">{role === 'student' ? 'Email' : 'Username'}</label>
              <div className="flex items-center">
                <FaUser className="absolute right-3 text-gray-500" />
                <input
                  type={role === 'student' ? 'email' : 'text'}
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder={role === 'student' ? 'Enter your email' : 'Enter your username'}
                  required
                />
              </div>
            </div>
            <div className="mb-6 relative">
              <label className="block text-blue-900 font-medium mb-2">Password</label>
              <div className="flex items-center">
                <FaLock className="absolute right-3 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
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
            {role === 'student' && (
              <p className="text-center mt-4 text-gray-600">
                Don't have an account?{' '}
                <Link to="/register/student" className="text-yellow-500 hover:underline">
                  Register here
                </Link>
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;