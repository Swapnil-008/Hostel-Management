import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBed, FaBath, FaImage, FaUser } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Navigate } from 'react-router-dom';
import roomWithBalcony1 from '../assets/room_with_balcony1.png';
import roomWithBalcony2 from '../assets/room_with_balcony2.png';
import roomWithoutBalcony1 from '../assets/room_without_balcony1.png';
import roomWithoutBalcony2 from '../assets/room_without_balcony2.png';
import boys1 from '../assets/boys_room1.png';
import boys2 from '../assets/boys_room2.png';

const AdminRoomAllocation = () => {
  const [view, setView] = useState('hostels');
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [students, setStudents] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.username) {
    return <Navigate to="/" />;
  }

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students');
      console.log('Fetched students:', res.data);
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      alert('Failed to fetch students.');
    }
  };

  useEffect(() => {
    if (view === 'girls-new' || view === 'girls-old') {
      fetchRooms('Girls', view === 'girls-new' ? 'New' : 'Old', selectedFloor);
    } else if (view === 'boys') {
      fetchRooms('Boys', null, selectedFloor);
    }
  }, [view, selectedFloor]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchRooms = async (hostelType, buildingType, floor) => {
    console.log('Fetching rooms with params:', { hostel_type: hostelType, building_type: buildingType, floor });
    try {
      const res = await axios.get('http://localhost:5000/api/rooms', {
        params: { hostel_type: hostelType, building_type: buildingType, floor }
      });
      console.log('Rooms fetched successfully:', res.data);
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      alert('Failed to fetch rooms. Please try again later.');
      setRooms([]);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedRoom || !selectedStudent || !selectedMember) {
      alert('Please select a room, member slot, and student.');
      return;
    }

    try {
      const student = students.find(s => s.id === parseInt(selectedStudent));
      if (!student) {
        throw new Error(`Student with id ${selectedStudent} not found`);
      }
      if (student.room_number) {
        alert(`This student is already assigned to ${student.room_number}. Please remove them first.`);
        return;
      }

      console.log(`Assigning student id ${selectedStudent} to room ${selectedRoom.room_number}, slot ${selectedMember}`);

      const updatedRoom = {
        member1_id: selectedMember === 'member1' ? parseInt(selectedStudent) : selectedRoom.member1_id,
        member2_id: selectedMember === 'member2' ? parseInt(selectedStudent) : selectedRoom.member2_id
      };
      await axios.put(`http://localhost:5000/api/rooms/update/${selectedRoom.id}`, updatedRoom);

      const roomNumber = `${selectedRoom.hostel_type} ${selectedRoom.building_type || ''} Room ${selectedRoom.room_number}`.trim();
      await axios.put(`http://localhost:5000/api/students/${selectedStudent}`, {
        room_number: roomNumber
      });

      await axios.post('http://localhost:5000/api/notifications/send', {
        admin_id: user.id,
        message: `You have been assigned to ${roomNumber} by admin ${user.username}.`,
        notification_type: 'Room Assignment',
        student_id: selectedStudent,
        student_email: student.email
      });

      setStudents(prev =>
        prev.map(s =>
          s.id === parseInt(selectedStudent) ? { ...s, room_number: roomNumber } : s
        )
      );

      alert(`Student assigned successfully! The student has been notified.`);
      setSelectedRoom(null);
      setSelectedMember(null);
      setSelectedStudent('');
      fetchRooms(
        view === 'boys' ? 'Boys' : 'Girls',
        view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
        selectedFloor
      );
    } catch (err) {
      console.error('Error assigning student:', err);
      alert(err.response?.data?.error || err.message || 'Failed to assign student.');
    }
  };

  const handleRemoveStudent = async (roomId, member) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        throw new Error('Room not found');
      }
      const studentId = member === 'member1' ? room.member1_id : room.member2_id;
      if (!studentId) {
        throw new Error('No student assigned to this slot');
      }
      const student = students.find(s => s.id === studentId);
      if (!student) {
        throw new Error(`Student with id ${studentId} not found`);
      }

      console.log(`Removing student id ${studentId} from room ${room.room_number}`);

      const updatedRoom = {
        member1_id: member === 'member1' ? null : room.member1_id,
        member2_id: member === 'member2' ? null : room.member2_id
      };
      await axios.put(`http://localhost:5000/api/rooms/update/${roomId}`, updatedRoom);

      const roomNumber = `${room.hostel_type} ${room.building_type || ''} Room ${room.room_number}`.trim();
      await axios.post('http://localhost:5000/api/notifications/send', {
        admin_id: user.id,
        message: `You have been removed from ${roomNumber} by admin ${user.username}.`,
        notification_type: 'Room Removal',
        student_id: studentId,
        student_email: student.email
      });

      setStudents(prev =>
        prev.map(s =>
          s.id === studentId ? { ...s, room_number: null } : s
        )
      );

      alert('Student removed successfully! The student has been notified.');
      fetchRooms(
        view === 'boys' ? 'Boys' : 'Girls',
        view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
        selectedFloor
      );
    } catch (err) {
      console.error('Error removing student:', err);
      alert(err.response?.data?.error || err.message || 'Failed to remove student.');
    }
  };

  const hasVacancy = (room) => {
    return !room.member1_id || !room.member2_id;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        {view === 'hostels' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="section-title">Admin Room Allocation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setView('girls')}
              >
                <h3 className="text-2xl font-bold text-blue-900">Girls' Hostel</h3>
                <p className="text-gray-600 mt-2">Manage rooms in the Girls' Hostel</p>
              </div>
              <div
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setView('boys')}
              >
                <h3 className="text-2xl font-bold text-blue-900">Boys' Hostel</h3>
                <p className="text-gray-600 mt-2">Manage rooms in the Boys' Hostel</p>
              </div>
            </div>
          </div>
        )}

        {view === 'girls' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="section-title">Girls' Hostel</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setView('girls-new')}
              >
                <h3 className="text-2xl font-bold text-blue-900">New Building</h3>
                <p className="text-gray-600 mt-2">Manage rooms in the New Building</p>
              </div>
              <div
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setView('girls-old')}
              >
                <h3 className="text-2xl font-bold text-blue-900">Old Building</h3>
                <p className="text-gray-600 mt-2">Manage rooms in the Old Building</p>
              </div>
            </div>
          </div>
        )}

        {(view === 'girls-new' || view === 'girls-old' || view === 'boys') && (
          <div className="max-w-7xl mx-auto">
            <h2 className="section-title">
              {view === 'girls-new' && 'Girls\' Hostel - New Building'}
              {view === 'girls-old' && 'Girls\' Hostel - Old Building'}
              {view === 'boys' && 'Boys\' Hostel'}
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Instructions</h3>
              <p className="text-gray-600">
                {view === 'girls-new'
                  ? 'Every room in the New Building has an attached washroom, bathroom, and balcony. Each room accommodates 2 members.'
                  : view === 'girls-old'
                  ? 'Every room in the Old Building has an attached washroom and bathroom but no balcony. Each room accommodates 2 members.'
                  : 'Every room in the Boys\' Hostel has an attached washroom and bathroom but no balcony. Each room accommodates 2 members.'}
              </p>
              <p className="text-gray-600 mt-2">
                Rent: ₹{view === 'girls-new' ? '8000' : '7000'} per person per month. Annual rent: ₹{view === 'girls-new' ? '96000' : '84000'} per person.
              </p>
            </div>

            {view === 'girls-new' && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Room Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <img src={roomWithBalcony1} alt="Room 1 - New Building" className="rounded-lg" />
                  <img src={roomWithBalcony2} alt="Room 2 - New Building" className="rounded-lg" />
                </div>
              </div>
            )}
            {view === 'girls-old' && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Room Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <img src={roomWithoutBalcony1} alt="Room 1 - Old Building" className="rounded-lg" />
                  <img src={roomWithoutBalcony2} alt="Room 2 - Old Building" className="rounded-lg" />
                </div>
              </div>
            )}
            {view === 'boys' && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Room Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <img src={boys1} alt="Room 1 - Boys' Hostel" className="rounded-lg" />
                  <img src={boys2} alt="Room 2 - Boys' Hostel" className="rounded-lg" />
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Building Layout</h3>
              <p className="text-gray-600 mb-4">
                The building has 6 floors, with 8 rooms per floor. All rooms have a capacity of 2 members.
              </p>
              <div className="flex space-x-4 mb-4">
                {[1, 2, 3, 4, 5, 6].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-4 py-2 rounded-lg ${selectedFloor === floor ? 'bg-blue-900 text-white' : 'bg-gray-200 text-blue-900'}`}
                  >
                    Floor {floor}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`border rounded-lg p-4 shadow-md ${hasVacancy(room) ? 'bg-green-100' : 'bg-red-100'}`}
                    >
                      <h4 className="text-lg font-semibold text-blue-900">Room {room.room_number}</h4>
                      <p className="text-gray-600">Capacity: 2 Members</p>
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span>Member 1:</span>
                          {room.member1_id ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-900">{room.member1_name}</span>
                              <button
                                onClick={() => handleRemoveStudent(room.id, 'member1')}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedRoom(room);
                                setSelectedMember('member1');
                              }}
                              className="text-blue-900 hover:underline"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Member 2:</span>
                          {room.member2_id ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-900">{room.member2_name}</span>
                              <button
                                onClick={() => handleRemoveStudent(room.id, 'member2')}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedRoom(room);
                                setSelectedMember('member2');
                              }}
                              className="text-blue-900 hover:underline"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-600">No rooms available for this selection.</p>
                )}
              </div>
            </div>

            {selectedRoom && selectedMember && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Assign Student to Room {selectedRoom.room_number} ({selectedMember === 'member1' ? 'Member 1' : 'Member 2'})
                </h3>
                <div className="mb-4">
                  <label className="block text-blue-900 font-medium mb-2">Select Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} (ID: {student.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleAssignStudent}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg"
                  >
                    Assign Student
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRoom(null);
                      setSelectedMember(null);
                      setSelectedStudent('');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminRoomAllocation;