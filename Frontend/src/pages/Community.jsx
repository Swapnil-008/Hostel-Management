import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaUserShield, FaUserMd, FaImages, FaBook } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Community = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [images, setImages] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', phone_no: '', specialization: '', availability: '' });

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5000/api/students');
      console.log('Fetched students:', res.data);
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
      console.log('Fetched admins:', res.data);
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
      console.log('Fetched doctor:', res.data);
      setDoctor(res.data);
      setDoctorForm({
        name: res.data.name,
        email: res.data.email,
        phone_no: res.data.phone_no,
        specialization: res.data.specialization,
        availability: res.data.availability,
      });
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
      console.log('Fetched images:', res.data);
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
      console.log('Fetched rules:', res.data);
      setRules(res.data);
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError(err.response?.data?.error || 'Failed to fetch hostel rules');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/hostel-doctors/${doctor.id}`, doctorForm);
      alert('Hostel doctor updated successfully');
      fetchDoctor(); // Refresh doctor data
    } catch (err) {
      console.error('Error updating doctor:', err);
      alert(err.response?.data?.error || 'Failed to update hostel doctor');
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
          <div className="grid grid-cols- sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          </div>
          <div className="grid grid-cols- sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
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
                                  <td className="p-3">
                                    {student.room_number ? student.room_number : 'Not Allocated'}
                                  </td>
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
                                  <td className="p-3">{admin.phoneNo}</td>
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
                          <p className="text-gray-600 mb-2"><strong>Phone Number:</strong> {doctor.phone_no}</p>
                          <p className="text-gray-600 mb-2"><strong>Specialization:</strong> {doctor.specialization}</p>
                          <p className="text-gray-600 mb-4"><strong>Availability:</strong> {doctor.availability}</p>

                          {user && user.username && (
                            <div className="mt-6">
                              <h4 className="text-xl font-semibold text-blue-900 mb-4">Update Doctor Information</h4>
                              <form onSubmit={handleDoctorUpdate}>
                                <div className="mb-4">
                                  <label className="block text-blue-900 font-medium mb-2">Name</label>
                                  <input
                                    type="text"
                                    value={doctorForm.name}
                                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                                    className="input-field"
                                    required
                                  />
                                </div>
                                <div className="mb-4">
                                  <label className="block text-blue-900 font-medium mb-2">Email</label>
                                  <input
                                    type="email"
                                    value={doctorForm.email}
                                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                                    className="input-field"
                                    required
                                  />
                                </div>
                                <div className="mb-4">
                                  <label className="block text-blue-900 font-medium mb-2">Phone Number</label>
                                  <input
                                    type="text"
                                    value={doctorForm.phone_no}
                                    onChange={(e) => setDoctorForm({ ...doctorForm, phone_no: e.target.value })}
                                    className="input-field"
                                    required
                                  />
                                </div>
                                <div className="mb-4">
                                  <label className="block text-blue-900 font-medium mb-2">Specialization</label>
                                  <input
                                    type="text"
                                    value={doctorForm.specialization}
                                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                                    className="input-field"
                                    required
                                  />
                                </div>
                                <div className="mb-4">
                                  <label className="block text-blue-900 font-medium mb-2">Availability</label>
                                  <input
                                    type="text"
                                    value={doctorForm.availability}
                                    onChange={(e) => setDoctorForm({ ...doctorForm, availability: e.target.value })}
                                    className="input-field"
                                    required
                                  />
                                </div>
                                <button type="submit" className="button">Update Doctor</button>
                              </form>
                            </div>
                          )}
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

export default Community;