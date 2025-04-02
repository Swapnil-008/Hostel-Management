import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBed, FaBath, FaImage, FaUserFriends } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Navigate } from 'react-router-dom';

const AdminRoomAllocation = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [rooms, setRooms] = useState([]);
  const [preferences, setPreferences] = useState({
    preferred_capacity: 2,
    same_state_preference: false,
    attached_washroom: false,
    gallery: false,
  });
  const [calculatedRent, setCalculatedRent] = useState(0);
  const [allocatedRoom, setAllocatedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  // Redirect if not an admin
  if (!user || !user.username) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/students');
        setStudents(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch students');
      }
    };

    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/rooms');
        setRooms(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
    fetchRooms();
  }, []);

  useEffect(() => {
    // Calculate rent based on preferences
    let baseRent = preferences.preferred_capacity === 2 ? 6000 : 4500; // Base rent per person
    let totalRent = baseRent;

    if (preferences.attached_washroom) {
      totalRent += 1000; // Additional cost for attached washroom
    }
    if (preferences.gallery) {
      totalRent += 500; // Additional cost for gallery
    }

    setCalculatedRent(totalRent);
  }, [preferences]);

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/rooms/allocate', {
        student_id: selectedStudent,
        ...preferences,
      });

      // Update the student's room_number in the students table
      await axios.put(`http://localhost:5000/api/students/${selectedStudent}`, {
        room_number: `Room ${res.data.room.id}`,
      });

      setAllocatedRoom(res.data.room);
      alert('Room allocated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to allocate room');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title">Admin Room Allocation</h2>
        <div className="max-w-5xl mx-auto">
          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">How Rent is Calculated</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Base rent per person: ₹6000 for 2 members, ₹4500 for 3 members.</li>
              <li>Room size adjustment: Small (8’x10’): -₹500, Medium (10’x12’): No change, Large (12’x14’): +₹500.</li>
              <li>Attached washroom: +₹1000 per person.</li>
              <li>Gallery: +₹500 per person.</li>
              <li>
                Example: A medium room with 2 members, attached washroom, and gallery:
                <br />
                Base: ₹6000 + Washroom: ₹1000 + Gallery: ₹500 = ₹7500 per person.
                <br />
                Total room rent: ₹7500 x 2 = ₹15,000.
              </li>
            </ul>
          </div>

          {/* Select Student */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Select Student</h3>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="input-field mb-4"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} (ID: {student.id})
                </option>
              ))}
            </select>
          </div>

          {/* Preferences Form */}
          {!allocatedRoom && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Select Room Preferences</h3>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-blue-900 font-medium mb-2">Number of Roommates</label>
                  <select
                    name="preferred_capacity"
                    value={preferences.preferred_capacity}
                    onChange={handlePreferenceChange}
                    className="input-field"
                  >
                    <option value={2}>2 Members</option>
                    <option value={3}>3 Members</option>
                  </select>
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="same_state_preference"
                    checked={preferences.same_state_preference}
                    onChange={handlePreferenceChange}
                    className="mr-2"
                  />
                  <label className="text-blue-900 font-medium">Prefer roommates from the same state</label>
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="attached_washroom"
                    checked={preferences.attached_washroom}
                    onChange={handlePreferenceChange}
                    className="mr-2"
                  />
                  <label className="text-blue-900 font-medium">Attached Washroom</label>
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="gallery"
                    checked={preferences.gallery}
                    onChange={handlePreferenceChange}
                    className="mr-2"
                  />
                  <label className="text-blue-900 font-medium">Gallery</label>
                </div>
                <div className="mb-4">
                  <p className="text-blue-900 font-bold">
                    Estimated Rent per Person: ₹{calculatedRent}
                  </p>
                  <p className="text-blue-900 font-bold">
                    Total Room Rent: ₹{calculatedRent * preferences.preferred_capacity}
                  </p>
                </div>
                <button type="submit" className="button">
                  Allocate Room
                </button>
              </form>
            </div>
          )}

          {/* Allocated Room */}
          {allocatedRoom && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Allocated Room</h3>
              <div className="flex items-center space-x-4">
                <FaBed className="text-blue-900 text-3xl" />
                <div>
                  <p className="text-blue-900 font-medium">Room Size: {allocatedRoom.size}</p>
                  <p className="text-blue-900">Capacity: {allocatedRoom.capacity} Members</p>
                  <p className="text-blue-900">Attached Washroom: {allocatedRoom.has_washroom ? 'Yes' : 'No'}</p>
                  <p className="text-blue-900">Gallery: {allocatedRoom.has_gallery ? 'Yes' : 'No'}</p>
                  <p className="text-blue-900">Rent per Person: ₹{allocatedRoom.rent_per_person}</p>
                  <p className="text-blue-900">Total Room Rent: ₹{allocatedRoom.total_rent}</p>
                </div>
              </div>
            </div>
          )}

          {/* Available Rooms */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Available Rooms</h3>
            {loading ? (
              <p className="text-center text-blue-900">Loading rooms...</p>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <FaBed className="text-blue-900 text-2xl" />
                      <h4 className="text-lg font-semibold text-blue-900">{room.size}</h4>
                    </div>
                    <p className="text-blue-900 flex items-center">
                      <FaUserFriends className="mr-2" /> Capacity: {room.capacity} Members
                    </p>
                    <p className="text-blue-900 flex items-center">
                      <FaBath className="mr-2" /> Attached Washroom: {room.has_washroom ? 'Yes' : 'No'}
                    </p>
                    <p className="text-blue-900 flex items-center">
                      <FaImage className="mr-2" /> Gallery: {room.has_gallery ? 'Yes' : 'No'}
                    </p>
                    <p className="text-blue-900 font-medium mt-2">
                      Rent per Person: ₹{room.rent_per_person}
                    </p>
                    <p className="text-blue-900 font-medium">
                      Total Room Rent: ₹{room.total_rent}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center">No rooms available.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminRoomAllocation;