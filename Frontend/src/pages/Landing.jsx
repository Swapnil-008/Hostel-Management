import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserGraduate,
  FaUtensils,
  FaClipboardCheck,
  FaTshirt,
  FaShieldAlt,
  FaBroom,
  FaWifi,
  FaDumbbell,
  FaBook,
  FaBed,
  FaTv,
  FaWater
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-blue-50 py-20 text-center fade-in">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">Welcome to HostelElite</h1>
          <p className="text-xl text-gray-600 mb-8">Your Home Away from Home</p>
          <div className="flex justify-center space-x-6">
            <Link to="/login/student" className="button">Student Login</Link>
            <Link to="/login/admin" className="button">Admin Login</Link>
          </div>
        </section>

        {/* Facilities Section */}
        <section className="py-16 bg-blue-50 section-border">
          <h2 className="section-title">Hostel Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="facility-card">
              <FaUserGraduate className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Comfortable Rooms</h3>
              <p className="text-gray-600">Spacious rooms with Wi-Fi and study desks.</p>
            </div>
            <div className="facility-card">
              <FaUtensils className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Canteen Services</h3>
              <p className="text-gray-600">Healthy, hygienic food available daily.</p>
            </div>
            <div className="facility-card">
              <FaClipboardCheck className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Attendance Tracking</h3>
              <p className="text-gray-600">Real-time attendance tracking for students.</p>
            </div>
            <div className="facility-card">
              <FaTshirt className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Laundry Services</h3>
              <p className="text-gray-600">Convenient laundry services for students.</p>
            </div>
            <div className="facility-card">
              <FaShieldAlt className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">24/7 Security</h3>
              <p className="text-gray-600">CCTV surveillance and security guards.</p>
            </div>
            <div className="facility-card">
              <FaBroom className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Room Cleaning</h3>
              <p className="text-gray-600">Regular cleaning services for hygiene.</p>
            </div>
            <div className="facility-card">
              <FaWifi className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">High-Speed Wi-Fi</h3>
              <p className="text-gray-600">Uninterrupted internet access for all students.</p>
            </div>
            <div className="facility-card">
              <FaDumbbell className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Gym Facilities</h3>
              <p className="text-gray-600">Stay fit with our on-site gym.</p>
            </div>
            <div className="facility-card">
              <FaBook className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Library Access</h3>
              <p className="text-gray-600">Quiet study spaces and a wide range of books.</p>
            </div>
            <div className="facility-card">
              <FaBed className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Cozy Beds</h3>
              <p className="text-gray-600">Comfortable beds for a good night's sleep.</p>
            </div>
            <div className="facility-card">
              <FaTv className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Common Room</h3>
              <p className="text-gray-600">Relax and socialize with a TV and games.</p>
            </div>
            <div className="facility-card">
              <FaWater className="text-blue-900 text-4xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Water Purifier</h3>
              <p className="text-gray-600">Access to clean and safe drinking water.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;