import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminComplaintsView = () => {
  const [complaints, setComplaints] = useState([]);
  const [replies, setReplies] = useState({}); // Store replies for each complaint
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')); // Admin user
  const navigate = useNavigate(); // Use navigate for redirection

  useEffect(() => {
    console.log('useEffect running...');
    if (!user || !user.username) {
      // Redirect to login if not an admin using navigate
      navigate('/login/admin');
      return; // Exit early to prevent further execution
    }

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('http://localhost:5000/api/complaints');
        setComplaints(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [navigate]); // Depend on navigate instead of user

  const handleReplyChange = (complaintId, message) => {
    setReplies((prevReplies) => ({
      ...prevReplies,
      [complaintId]: message,
    }));
  };

  const handleReply = async (complaintId, studentId) => {
    const message = replies[complaintId] || '';
    if (!message) {
      alert('Please enter a message to send.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/notifications/send', {
        student_id: studentId,
        message,
        admin_id: user.id,
        notification_type: 'Complaint Reply',
      });
      alert('Reply sent successfully');
      setReplies((prevReplies) => ({
        ...prevReplies,
        [complaintId]: '', // Clear the reply after sending
      }));
    } catch (err) {
      console.error('Error sending reply notification:', err);
      alert(err.response?.data?.error || 'Failed to send reply');
    }
  };

  const handleStatusChange = async (complaintId, newStatus, studentId) => {
    try {
      // Update the status on the backend
      await axios.put(`http://localhost:5000/api/complaints/${complaintId}`, { status: newStatus });

      // Send a notification to the student about the status change
      await axios.post('http://localhost:5000/api/notifications/send', {
        student_id: studentId,
        message: `Your complaint (ID: ${complaintId}) status has been updated to ${newStatus}.`,
        admin_id: user.id,
        notification_type: 'Complaint Status Update',
      });

      // Update the UI
      if (newStatus === 'completed') {
        // Remove the complaint from the state since it was deleted
        setComplaints(complaints.filter((complaint) => complaint.id !== complaintId));
      } else {
        // Update the status in the state
        setComplaints(
          complaints.map((complaint) =>
            complaint.id === complaintId ? { ...complaint, status: newStatus } : complaint
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
        <h1 className="section-title">Student Complaints</h1>
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <p className="text-center text-blue-900">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : complaints.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="border-b py-4">
                  <p className='mb-2'>
                    <strong className="text-blue-900">Complaint ID:</strong> {complaint.id}
                  </p>
                  <p className='mb-2'>
                    <strong className="text-blue-900">Student Name:</strong> {complaint.student_name}
                  </p>
                  <p className='mb-2'>
                    <strong className="text-blue-900">Description:</strong> {complaint.description}
                  </p>
                  <p className='mb-2'>
                    <strong className="text-blue-900">Status:</strong>
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value, complaint.student_id)}
                      className="border rounded p-1 ml-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="working">Working</option>
                      <option value="completed">Completed</option>
                    </select>
                  </p>
                  <p className='mb-2'>
                    <strong className="text-blue-900">Created At:</strong>{' '}
                    {new Date(complaint.created_at).toLocaleString()}
                  </p>
                  <div className="mt-4">
                    <textarea
                      className="input-field"
                      placeholder="Reply to this complaint..."
                      value={replies[complaint.id] || ''}
                      onChange={(e) => handleReplyChange(complaint.id, e.target.value)}
                    />
                    <button
                      className="button mt-2"
                      onClick={() => handleReply(complaint.id, complaint.student_id)}
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">No complaints found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminComplaintsView;