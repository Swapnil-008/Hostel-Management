import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaCalendarAlt, FaTshirt, FaClipboardCheck, FaUtensils, FaBed } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Admin user

  // Redirect if not an admin
  if (!user || !user.username) {
    return <Navigate to="/login/admin?redirect=/admin-dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-blue-50 py-20 text-center fade-in">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600 mb-8">Manage Hostel Operations</p>
        </section>

        {/* Navigation Cards */}
        <section className="py-16 bg-blue-50 section-border">
          <h2 className="section-title">Admin Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Link to="/admin-complaints" className="card">
              <FaExclamationCircle className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">View Complaints</h3>
              <p className="text-gray-600">Manage Complaints</p>
            </Link>
            <Link to="/admin-leaves" className="card">
              <FaCalendarAlt className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">View Leaves</h3>
              <p className="text-gray-600">Manage Leaves</p>
            </Link>
            <Link to="/laundry" className="card">
              <FaTshirt className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Laundry Requests</h3>
              <p className="text-gray-600">Manage Laundry</p>
            </Link>
            <Link to="/attendance" className="card">
              <FaClipboardCheck className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Mark Attendance</h3>
              <p className="text-gray-600">Mark Attendance</p>
            </Link>
            <Link to="/canteen-menu" className="card">
              <FaUtensils className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Set Menu</h3>
              <p className="text-gray-600">Manage Menu</p>
            </Link>
            <Link to="/admin-room-allocation" className="card">
              <FaBed className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Room Allocation</h3>
              <p className="text-gray-600">Allocate Rooms</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;