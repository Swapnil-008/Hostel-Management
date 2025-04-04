import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AddStudent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Redirect if not an admin
  if (!user || !user.username) {
    navigate('/');
    return null;
  }

  // Check for email in URL params (e.g., from notification link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/students', {
        name,
        email,
        password
      });
      alert('Student created successfully!');
      navigate('/admin-dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create student');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Add New Student</h2>
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
                  placeholder="Enter student name"
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
                  placeholder="Enter student email"
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
                  placeholder="Enter student password"
                  required
                />
              </div>
            </div>
            <button type="submit" className="button">
              Add Student
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddStudent;