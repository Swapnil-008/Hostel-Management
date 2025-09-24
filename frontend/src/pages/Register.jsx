import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Register = ({ role }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Use environment-based API URL
      await axios.post(`${API_BASE_URL}/api/auth/register/student`, {
        name,
        email,
        password
      });
      alert('Student registered successfully! You will be assigned a room by the admin.');
      navigate('/login/student');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Student Registration</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <label className="block text-blue-900 font-medium mb-2">Name</label>
              <div className="flex items-center">
                <FaUser className="absolute left-3 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label className="block text-blue-900 font-medium mb-2">Email</label>
              <div className="flex items-center">
                <FaEnvelope className="absolute left-3 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label className="block text-blue-900 font-medium mb-2">Password</label>
              <div className="flex items-center">
                <FaLock className="absolute left-3 text-gray-500" />
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
            <button type="submit" className="button">
              Register
            </button>
            <p className="text-center mt-4 text-gray-600">
              Already have an account?{' '}
              <Link to="/login/student" className="text-yellow-500 hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;