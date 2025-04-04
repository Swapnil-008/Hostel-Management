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

        
      </main>
      <Footer />
    </div>
  );
};

export default Landing;