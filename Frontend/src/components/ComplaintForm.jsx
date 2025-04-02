import React, { useState } from 'react';
import axios from 'axios';
import { FaExclamationCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ComplaintForm = () => {
  const [studentId, setStudentId] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/complaints', { student_id: studentId, description });
      alert('Complaint submitted!');
      setStudentId('');
      setDescription('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit complaint');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-blue-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <FaExclamationCircle className="text-blue-900 text-3xl mr-2" />
            <h2 className="text-2xl font-bold text-blue-900">File a Complaint</h2>
          </div>
          <div className="mb-4">
            <label className="block text-blue-900 font-medium mb-2">Student ID</label>
            <input
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="input-field"
              placeholder="Enter your student ID"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-900 font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows="4"
              placeholder="Describe your complaint"
              required
            />
          </div>
          <button type="submit" className="button">
            Submit Complaint
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default ComplaintForm;