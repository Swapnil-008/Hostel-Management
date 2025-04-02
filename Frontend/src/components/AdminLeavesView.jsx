import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminLeavesView = () => {
  const [leaves, setLeaves] = useState([]);
  const [notificationData, setNotificationData] = useState({ studentId: '', message: '' });
  const user = JSON.parse(localStorage.getItem('user')); // Admin user

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/leaves');
        setLeaves(res.data);
      } catch (err) {
        alert('Failed to fetch leave requests');
      }
    };
    fetchLeaves();
  }, []);

  const handleReply = async (studentId) => {
    if (!notificationData.message) {
      alert('Please enter a message to send.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/notifications/send', {
        student_id: studentId,
        message: notificationData.message,
        admin_id: user.id, // Include admin ID
        notification_type: 'Leave Reply', // Specify notification type
      });
      alert('Notification sent successfully');
      setNotificationData({ studentId: '', message: '' });
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h1 className="section-title">Leave Requests</h1>
        <div className="max-w-6xl mx-auto">
          {leaves.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              {leaves.map((leave) => (
                <div key={leave.id} className="border-b py-4">
                  <p><strong className="text-blue-900">Student ID:</strong> {leave.student_id}</p>
                  <p><strong className="text-blue-900">Start Date:</strong> {leave.start_date}</p>
                  <p><strong className="text-blue-900">End Date:</strong> {leave.end_date}</p>
                  <p><strong className="text-blue-900">Reason:</strong> {leave.reason}</p>
                  <p><strong className="text-blue-900">Status:</strong> {leave.status}</p>
                  <div className="mt-4">
                    <textarea
                      className="input-field"
                      placeholder="Reply to this leave request..."
                      value={notificationData.studentId === leave.student_id ? notificationData.message : ''}
                      onChange={(e) => setNotificationData({ studentId: leave.student_id, message: e.target.value })}
                    />
                    <button
                      className="button mt-2"
                      onClick={() => handleReply(leave.student_id)}
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">No leave requests found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLeavesView;