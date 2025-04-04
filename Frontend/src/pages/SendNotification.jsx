import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Navigate } from 'react-router-dom';

const SendNotification = () => {
  const [generalNotification, setGeneralNotification] = useState('');
  const user = JSON.parse(localStorage.getItem('user')); // Admin user

  // Redirect if not an admin
  if (!user || !user.username) {
    return <Navigate to="/login/admin?redirect=/send-notification" />;
  }

  const handleSendGeneralNotification = async (e) => {
    e.preventDefault();
    try {
      // Fetch all students
      const studentsRes = await axios.get('http://localhost:5000/api/students');
      const students = studentsRes.data;

      // Send notification to each student
      for (const student of students) {
        await axios.post('http://localhost:5000/api/notifications/send', {
          student_id: student.id,
          message: generalNotification,
          admin_id: user.id, // Include admin ID
          notification_type: 'General', // Specify notification type
        });
      }
      alert('General notification sent to all students');
      setGeneralNotification('');
    } catch (err) {
      console.error('Error sending general notification:', err);
      alert('Failed to send general notification');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-blue-50 p-10 text-center fade-in">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">Send General Notification</h1>
          <p className="text-xl text-gray-600 mb-8">Notify All Students</p>
        </section>

        {/* General Notification Section */}
        <section className="section-border">
          {/* <h2 className="section-title">Send General Notification</h2> */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSendGeneralNotification} className="bg-white rounded-xl shadow-lg p-6 m-10">
              <div className="mb-4">
                <label className="block text-blue-900 font-medium mb-2">Message</label>
                <textarea
                  value={generalNotification}
                  onChange={(e) => setGeneralNotification(e.target.value)}
                  className="input-field"
                  rows="3"
                  placeholder="Enter your message to all students..."
                  required
                />
              </div>
              <button type="submit" className="button">
                Send Notification
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SendNotification;