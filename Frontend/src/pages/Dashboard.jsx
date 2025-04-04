import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { FaCalendarAlt, FaExclamationCircle, FaClipboardCheck, FaTshirt, FaUtensils } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.username) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title">Student Dashboard</h2>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Welcome, {user.name}</h3>
            <p className="text-gray-600 mb-4">
              Manage your hostel activities using the services below.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/leaves" className="card">
              <FaCalendarAlt className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Apply for Leave</h3>
              <p className="text-gray-600">Submit a leave request.</p>
            </Link>
            <Link to="/complaints" className="card">
              <FaExclamationCircle className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">File a Complaint</h3>
              <p className="text-gray-600">Report an issue.</p>
            </Link>
            <Link to="/attendance" className="card">
              <FaClipboardCheck className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">View Attendance</h3>
              <p className="text-gray-600">Check your attendance.</p>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-5">
            <Link to="/laundry" className="card">
              <FaTshirt className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Laundry Request</h3>
              <p className="text-gray-600">Submit a laundry request.</p>
            </Link>
            <Link to="/canteen-menu" className="card">
              <FaUtensils className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">View Menu</h3>
              <p className="text-gray-600">Check the canteen menu.</p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;