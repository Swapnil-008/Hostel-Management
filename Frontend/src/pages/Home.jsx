import React from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaUserFriends } from 'react-icons/fa';
import Header from '../components/Header'; // Import reusable Header
import Footer from '../components/Footer'; // Import reusable Footer

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <Header /> {/* Replace hardcoded header */}
      <main className="flex-grow py-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">Welcome to Hostel Management</h2>
          <p className="text-gray-600 mb-8">
            Manage your hostel experience with ease. Apply for leaves, file complaints, check your attendance, and find the perfect room for you!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <FaBed className="text-blue-900 text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Room Allocation</h3>
              <p className="text-gray-600 mb-4">Find the perfect room based on your preferences.</p>
              <Link
                to="/room-allocation"
                className="inline-block bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300"
              >
                Allocate a Room
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <FaUserFriends className="text-blue-900 text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Community</h3>
              <p className="text-gray-600 mb-4">See all students in the hostel and their room numbers.</p>
              <Link
                to="/community"
                className="inline-block bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300"
              >
                View Community
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer /> {/* Replace hardcoded footer */}
    </div>
  );
};

export default Home;