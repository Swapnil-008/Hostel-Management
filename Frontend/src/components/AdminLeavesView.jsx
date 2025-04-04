import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminLeavesView = () => {
  const [leaves, setLeaves] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    console.log('useEffect running...');
    if (!user || !user.username) {
      navigate('/login/admin');
      return;
    }

    const fetchLeaves = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('http://localhost:5000/api/leaves');
        setLeaves(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [navigate]);

  const handleReplyChange = (leaveId, message) => {
    setReplies((prevReplies) => ({
      ...prevReplies,
      [leaveId]: message,
    }));
  };

  const handleReply = async (leaveId, studentId) => {
    const message = replies[leaveId] || '';
    if (!message) {
      alert('Please enter a message to send.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/notifications/send', {
        student_id: studentId,
        message,
        admin_id: user.id,
        notification_type: 'Leave Reply',
      });
      alert('Reply sent successfully');
      setReplies((prevReplies) => ({
        ...prevReplies,
        [leaveId]: '',
      }));
    } catch (err) {
      console.error('Error sending reply notification:', err);
      alert(err.response?.data?.error || 'Failed to send reply');
    }
  };

  const handleStatusChange = async (leaveId, newStatus, studentId) => {
    try {
      console.log(`Sending PUT request to /api/leaves/${leaveId} with status: ${newStatus}`);
      await axios.put(`http://localhost:5000/api/leaves/${leaveId}`, { status: newStatus });

      await axios.post('http://localhost:5000/api/notifications/send', {
        student_id: studentId,
        message: `Your leave request (ID: ${leaveId}) status has been updated to ${newStatus}.`,
        admin_id: user.id,
        notification_type: 'Leave Status Update',
      });

      if (newStatus === 'returned') {
        setLeaves(leaves.filter((leave) => leave.id !== leaveId));
      } else {
        setLeaves(
          leaves.map((leave) =>
            leave.id === leaveId ? { ...leave, status: newStatus } : leave
          )
        );
      }
      alert('Status updated successfully and notification sent to the student.');
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h1 className="section-title">Leave Requests</h1>
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <p className="text-center text-blue-900">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : leaves.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              {leaves.map((leave) => (
                <div key={leave.id} className="border-b py-4 last:border-b-0">
                  <p className="mb-2">
                    <strong className="text-blue-900">Leave ID:</strong> {leave.id}
                  </p>
                  <p className="mb-2">
                    <strong className="text-blue-900">Student Name:</strong> {leave.student_name}
                  </p>
                  <p className="mb-2">
                    <strong className="text-blue-900">Start Date:</strong>{' '}
                    {new Date(leave.start_date).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <strong className="text-blue-900">End Date:</strong>{' '}
                    {new Date(leave.end_date).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <strong className="text-blue-900">Reason:</strong> {leave.reason}
                  </p>
                  <p className="mb-2">
                    <strong className="text-blue-900">Status:</strong>
                    <select
                      value={leave.status}
                      onChange={(e) => handleStatusChange(leave.id, e.target.value, leave.student_id)}
                      className="border rounded p-1 ml-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="returned">Returned</option>
                    </select>
                  </p>
                  <p className="mb-2">
                    <strong className="text-blue-900">Date:</strong>{' '}
                    {new Date(leave.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-4">
                    <textarea
                      className="input-field w-full mb-2"
                      placeholder="Reply to this leave request..."
                      value={replies[leave.id] || ''}
                      onChange={(e) => handleReplyChange(leave.id, e.target.value)}
                    />
                    <button
                      className="button"
                      onClick={() => handleReply(leave.id, leave.student_id)}
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