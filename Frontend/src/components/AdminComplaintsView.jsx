import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminComplaintsView = () => {
  const [complaints, setComplaints] = useState([]);
  const [replies, setReplies] = useState({}); // Store replies for each complaint
  const user = JSON.parse(localStorage.getItem('user')); // Admin user

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaints');
        setComplaints(res.data);
      } catch (err) {
        alert('Failed to fetch complaints');
      }
    };
    fetchComplaints();
  }, []);

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
      alert('Notification sent successfully');
      setReplies((prevReplies) => ({
        ...prevReplies,
        [complaintId]: '', // Clear the reply after sending
      }));
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h1 className="section-title">Student Complaints</h1>
        <div className="max-w-6xl mx-auto">
          {complaints.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="border-b py-4">
                  <p><strong className="text-blue-900">Student ID:</strong> {complaint.student_id}</p>
                  <p><strong className="text-blue-900">Description:</strong> {complaint.description}</p>
                  <p><strong className="text-blue-900">Status:</strong> {complaint.status}</p>
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