import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LaundryForm = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [requestDate, setRequestDate] = useState('');
  const [laundryRequests, setLaundryRequests] = useState([]);

  useEffect(() => {
    if (user && user.username) {
      // Admin view: Fetch all laundry requests
      const fetchLaundryRequests = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/laundry-notifications');
          setLaundryRequests(res.data);
        } catch (err) {
          alert('Failed to fetch laundry requests');
        }
      };
      fetchLaundryRequests();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/laundry-notifications', {
        student_id: user.id,
        request_date: requestDate,
      });
      alert('Laundry request submitted successfully');
      setRequestDate('');
    } catch (err) {
      alert('Failed to submit laundry request');
    }
  };

  const handleAcceptLaundryRequest = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/laundry-notifications/${id}/accept`);
      alert('Laundry request accepted');
      const res = await axios.get('http://localhost:5000/api/laundry-notifications');
      setLaundryRequests(res.data);
    } catch (err) {
      alert('Failed to accept laundry request');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title">Laundry Services</h2>
        <div className="max-w-2xl mx-auto">
          {user && user.username ? (
            // Admin View
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Laundry Requests</h3>
              {laundryRequests.length > 0 ? (
                laundryRequests.map((request) => (
                  <div key={request.id} className="border-b py-4">
                    <p><strong className="text-blue-900">Student ID:</strong> {request.student_id}</p>
                    <p><strong className="text-blue-900">Request Date:</strong> {request.request_date}</p>
                    <p><strong className="text-blue-900">Status:</strong> {request.status}</p>
                    {request.status === 'Pending' && (
                      <button
                        className="button mt-2"
                        onClick={() => handleAcceptLaundryRequest(request.id)}
                      >
                        Accept Request
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center">No laundry requests found.</p>
              )}
            </div>
          ) : (
            // Student View
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-4">
                <label className="block text-blue-900 font-medium mb-2">Request Date</label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" className="button">
                Submit Laundry Request
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LaundryForm;