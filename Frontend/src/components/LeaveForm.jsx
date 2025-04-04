import React, { useState } from 'react';
import axios from 'axios';
import { FaCalendarAlt } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LeaveForm = () => {
  const [studentId, setStudentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/leaves', { student_id: studentId, start_date: startDate, end_date: endDate, reason });
      alert('Leave request submitted!');
      setStudentId('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit leave request');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-blue-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full m-10">
          <div className="flex items-center justify-center mb-6">
            <FaCalendarAlt className="text-blue-900 text-3xl mr-2" />
            <h2 className="text-2xl font-bold text-blue-900">Submit a Leave Request</h2>
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
            <label className="block text-blue-900 font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-900 font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-900 font-medium mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
              rows="4"
              placeholder="Reason for leave"
              required
            />
          </div>
          <button type="submit" className="button">
            Submit Leave Request
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default LeaveForm;