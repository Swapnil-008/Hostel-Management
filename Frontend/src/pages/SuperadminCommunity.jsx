import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom'; // Add Navigate for auth check
import axios from 'axios';
import { FaUsers, FaUserShield, FaUserMd, FaImages, FaBook } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SuperadminCommunity = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [images, setImages] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  // Redirect if not Superadmin
  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/login/superadmin" />;
  }

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5000/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.error || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5000/api/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError(err.response?.data?.error || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5000/api/hostel-doctors');
      setDoctor(res.data[0]); // Assuming one doctor, adjust if multiple
    } catch (err) {
      console.error('Error fetching doctor:', err);
      setError(err.response?.data?.error || 'Failed to fetch hostel doctor');
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5000/api/hostel-images');
      setImages(res.data);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.response?.data?.error || 'Failed to fetch hostel images');
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5000/api/hostel-rules');
      setRules(res.data);
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError(err.response?.data?.error || 'Failed to fetch hostel rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    if (section === 'students') fetchStudents();
    if (section === 'admins') fetchAdmins();
    if (section === 'doctor') fetchDoctor();
    if (section === 'images') fetchImages();
    if (section === 'rules') fetchRules();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title">Community</h2>
        <div className="max-w-7xl mx-auto">
          {/* Grid of Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer flex items-center justify-center"
              onClick={() => handleSectionClick('students')}
            >
              <FaUsers className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Hostel Students</h3>
            </div>
            <div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer flex items-center justify-center"
              onClick={() => handleSectionClick('admins')}
            >
              <FaUserShield className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Admins</h3>
            </div>
            <div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer flex items-center justify-center"
              onClick={() => handleSectionClick('doctor')}
            >
              <FaUserMd className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Hostel Doctor</h3>
            </div>
            <div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer flex items-center justify-center"
              onClick={() => handleSectionClick('images')}
            >
              <FaImages className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Hostel Images</h3>
            </div>
            <div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer flex items-center justify-center"
              onClick={() => handleSectionClick('rules')}
            >
              <FaBook className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Hostel Rules</h3>
            </div>
          </div>

          {/* Display Section Content */}
          {activeSection && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              {loading ? (
                <p className="text-center text-blue-900">Loading...</p>
              ) : error ? (
                <p className="text-center text-red-600">{error}</p>
              ) : (
                <>
                  {activeSection === 'students' && (
                    <>
                      <h3 className="text-2xl font-bold text-blue-900 mb-6">Hostel Students</h3>
                      {students.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-blue-900 text-white">
                                <th className="p-3 rounded-tl-lg">Student ID</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3 rounded-tr-lg">Room Number</th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.map((student, index) => (
                                <tr
                                  key={student.id}
                                  className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-100 transition-colors duration-300`}
                                >
                                  <td className="p-3">{student.id}</td>
                                  <td className="p-3">{student.name}</td>
                                  <td className="p-3">{student.email}</td>
                                  <td className="p-3">{student.room_number || 'Not Allocated'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center">No students found.</p>
                      )}
                    </>
                  )}

                  {activeSection === 'admins' && (
                    <>
                      <h3 className="text-2xl font-bold text-blue-900 mb-6">Admins</h3>
                      {admins.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-blue-900 text-white">
                                <th className="p-3 rounded-tl-lg">Admin ID</th>
                                <th className="p-3">Username</th>
                                <th className="p-3">Email</th>
                                <th className="p-3 rounded-tr-lg">Phone Number</th>
                              </tr>
                            </thead>
                            <tbody>
                              {admins.map((admin, index) => (
                                <tr
                                  key={admin.id}
                                  className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-100 transition-colors duration-300`}
                                >
                                  <td className="p-3">{admin.id}</td>
                                  <td className="p-3">{admin.username}</td>
                                  <td className="p-3">{admin.email}</td>
                                  <td className="p-3">{admin.phoneNo || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center">No admins found.</p>
                      )}
                    </>
                  )}

                  {activeSection === 'doctor' && (
                    <>
                      <h3 className="text-2xl font-bold text-blue-900 mb-6">Hostel Doctor</h3>
                      {doctor ? (
                        <div>
                          <p className="text-gray-600 mb-2"><strong>Name:</strong> {doctor.name}</p>
                          <p className="text-gray-600 mb-2"><strong>Email:</strong> {doctor.email}</p>
                          <p className="text-gray-600 mb-2"><strong>Phone Number:</strong> {doctor.phone_no || 'N/A'}</p>
                          <p className="text-gray-600 mb-2"><strong>Specialization:</strong> {doctor.specialization || 'N/A'}</p>
                          <p className="text-gray-600 mb-4"><strong>Availability:</strong> {doctor.availability || 'N/A'}</p>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center">No hostel doctor found.</p>
                      )}
                    </>
                  )}

                  {activeSection === 'images' && (
                    <>
                      <h3 className="text-2xl font-bold text-blue-900 mb-6">Hostel Images</h3>
                      {images.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {images.map((image) => (
                            <div key={image.id} className="border rounded-lg p-4 shadow-md">
                              <img
                                src={image.image_url}
                                alt={image.caption || 'Hostel Image'}
                                className="w-full h-48 object-cover rounded-lg mb-2"
                              />
                              {image.caption && (
                                <p className="text-gray-600 text-center">{image.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center">No images available.</p>
                      )}
                    </>
                  )}

                  {activeSection === 'rules' && (
                    <>
                      <h3 className="text-2xl font-bold text-blue-900 mb-6">Hostel Rules</h3>
                      {rules.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-600">
                          {rules.map((rule) => (
                            <li key={rule.id} className="mb-2">{rule.rule_text}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 text-center">No rules found.</p>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuperadminCommunity;