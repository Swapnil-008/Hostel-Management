import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FaUsers,
  FaCalendarAlt,
  FaExclamationCircle,
  FaUserGraduate,
  FaBed,
  FaClipboardCheck,
  FaPaperPlane,
} from 'react-icons/fa';
import SuperadminAttendanceView from '../components/SuperadminAttendanceView';

const SuperadminDashboard = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [view, setView] = useState('hostels');
  const [notification, setNotification] = useState('');
  const [searchLeaves, setSearchLeaves] = useState('');
  const [searchComplaints, setSearchComplaints] = useState('');
  const [searchAdmissions, setSearchAdmissions] = useState('');
  const [searchAttendance, setSearchAttendance] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/login/superadmin" />;
  }

  useEffect(() => {
    if (activeSection === 'leaves') fetchLeaves();
    if (activeSection === 'complaints') fetchComplaints();
    if (activeSection === 'admissions') fetchAdmissions();
    if (activeSection === 'rooms' && (view === 'girls-new' || view === 'girls-old' || view === 'boys')) {
      fetchRooms(
        view === 'boys' ? 'Boys' : 'Girls',
        view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
        selectedFloor
      );
    }
  }, [activeSection, view, selectedFloor]);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  const fetchAdmissions = async () => {
    try {
      console.log('Fetching admissions...');
      const [studentsRes, paymentsRes, roomsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/students'),
        axios.get('http://localhost:5000/api/payments'),
        axios.get('http://localhost:5000/api/rooms'),
      ]);
      console.log('Students:', studentsRes.data);
      console.log('Payments:', paymentsRes.data);
      console.log('Rooms:', roomsRes.data);
      const students = studentsRes.data;
      const payments = paymentsRes.data.filter(p => p.status === 'completed');
      const rooms = roomsRes.data;

      const admissionData = students.map(student => {
        const payment = payments.find(p => p.student_id === student.id);
        const room = rooms.find(r => r.member1_id === student.id || r.member2_id === student.id);
        return {
          student_name: student.name,
          room_number: room ? `${room.hostel_type} ${room.building_type || ''} Room ${room.room_number}` : 'Not Assigned',
          admission_date: payment ? new Date(payment.created_at).toLocaleDateString() : 'Pending',
        };
      });
      console.log('Admission data:', admissionData);
      setAdmissions(admissionData);
    } catch (err) {
      console.error('Error fetching admissions:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Status:', err.response.status);
      }
      setAdmissions([]);
    }
  };

  const fetchRooms = async (hostelType, buildingType, floor) => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms', {
        params: { hostel_type: hostelType, building_type: buildingType, floor },
      });
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/notifications/broadcast', {
        superadmin_id: user.id,
        message: notification,
        notification_type: 'Broadcast',
      });
      alert('Broadcast notification sent to all students and admins!');
      setNotification('');
    } catch (err) {
      console.error('Error sending broadcast:', err);
      alert('Failed to send broadcast notification');
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const searchTrimmed = searchLeaves.trim().toLowerCase();
    if (!searchTrimmed) return true;
    if (searchTrimmed.endsWith(' ')) {
      return leave.student_name && leave.student_name.toLowerCase() === searchTrimmed.slice(0, -1);
    }
    const regex = new RegExp(`\\b${searchTrimmed}\\b`);
    return regex.test(leave.student_name ? leave.student_name.toLowerCase() : '');
  });

  const filteredComplaints = complaints.filter(complaint => {
    const searchTrimmed = searchComplaints.trim().toLowerCase();
    if (!searchTrimmed) return true;
    if (searchTrimmed.endsWith(' ')) {
      return complaint.student_name && complaint.student_name.toLowerCase() === searchTrimmed.slice(0, -1);
    }
    const regex = new RegExp(`\\b${searchTrimmed}\\b`);
    return regex.test(complaint.student_name ? complaint.student_name.toLowerCase() : '');
  });

  const filteredAdmissions = admissions.filter(admission => {
    const searchTrimmed = searchAdmissions.trim().toLowerCase();
    if (!searchTrimmed) return true;
    if (searchTrimmed.endsWith(' ')) {
      return admission.student_name.toLowerCase() === searchTrimmed.slice(0, -1);
    }
    const regex = new RegExp(`\\b${searchTrimmed}\\b`);
    return regex.test(admission.student_name.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title text-center text-3xl font-bold text-blue-900 mb-8">Superadmin Dashboard</h2>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link to="/superadmin/community" className="dashboard-card">
              <FaUsers className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Community</h3>
            </Link>
            <div className="dashboard-card" onClick={() => setActiveSection(activeSection === 'leaves' ? null : 'leaves')}>
              <FaCalendarAlt className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Leave Requests</h3>
            </div>
            <div className="dashboard-card" onClick={() => setActiveSection(activeSection === 'complaints' ? null : 'complaints')}>
              <FaExclamationCircle className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Complaints</h3>
            </div>
            <div className="dashboard-card" onClick={() => setActiveSection(activeSection === 'admissions' ? null : 'admissions')}>
              <FaUserGraduate className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Student Admissions</h3>
            </div>
            <div className="dashboard-card" onClick={() => setActiveSection(activeSection === 'rooms' ? null : 'rooms')}>
              <FaBed className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Rooms Layout</h3>
            </div>
            <div className="dashboard-card" onClick={() => setActiveSection(activeSection === 'attendance' ? null : 'attendance')}>
              <FaClipboardCheck className="text-blue-900 text-3xl mr-2" />
              <h3 className="text-xl font-semibold text-blue-900">Attendance</h3>
            </div>
          </div>

          {activeSection === 'leaves' && (
            <div>
              <input
                type="text"
                value={searchLeaves}
                onChange={(e) => setSearchLeaves(e.target.value)}
                className="input-field mb-4 w-full max-w-md mx-auto block"
                placeholder="Search by student name..."
              />
              {filteredLeaves.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="grid gap-4">
                    {filteredLeaves.map(leave => (
                      <div
                        key={leave.id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200"
                      >
                        <p><strong>Student:</strong> {leave.student_name || 'Unknown'}</p>
                        <p><strong>Start Date:</strong> {new Date(leave.start_date).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(leave.end_date).toLocaleDateString()}</p>
                        <p><strong>Reason:</strong> {leave.reason}</p>
                        <p><strong>Status:</strong> {leave.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center">No leave requests found.</p>
              )}
            </div>
          )}

          {activeSection === 'complaints' && (
            <div>
              <input
                type="text"
                value={searchComplaints}
                onChange={(e) => setSearchComplaints(e.target.value)}
                className="input-field mb-4 w-full max-w-md mx-auto block"
                placeholder="Search by student name..."
              />
              {filteredComplaints.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="grid gap-4">
                    {filteredComplaints.map(complaint => (
                      <div
                        key={complaint.id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200"
                      >
                        <p><strong>Student:</strong> {complaint.student_name || 'Unknown'}</p>
                        <p><strong>Description:</strong> {complaint.description}</p>
                        <p><strong>Status:</strong> {complaint.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center">No complaints found.</p>
              )}
            </div>
          )}

          {activeSection === 'admissions' && (
            <div>
              <input
                type="text"
                value={searchAdmissions}
                onChange={(e) => setSearchAdmissions(e.target.value)}
                className="input-field mb-4 w-full max-w-md mx-auto block"
                placeholder="Search by student name..."
              />
              {filteredAdmissions.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white">
                          <th className="p-3 rounded-tl-lg">Student Name</th>
                          <th className="p-3">Room Number</th>
                          <th className="p-3 rounded-tr-lg">Admission Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdmissions.map((admission, index) => (
                          <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="p-3">{admission.student_name}</td>
                            <td className="p-3">{admission.room_number}</td>
                            <td className="p-3">{admission.admission_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center">No admissions found.</p>
              )}
            </div>
          )}

          {activeSection === 'rooms' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Rooms Layout</h3>
              {view === 'hostels' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-200 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl" onClick={() => setView('girls')}>
                    <h4 className="text-xl font-bold text-blue-900">Girls' Hostel</h4>
                  </div>
                  <div className="bg-gray-200 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl" onClick={() => setView('boys')}>
                    <h4 className="text-xl font-bold text-blue-900">Boys' Hostel</h4>
                  </div>
                </div>
              )}
              {view === 'girls' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-200 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl" onClick={() => setView('girls-new')}>
                    <h4 className="text-xl font-bold text-blue-900">New Building</h4>
                  </div>
                  <div className="bg-gray-200 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl" onClick={() => setView('girls-old')}>
                    <h4 className="text-xl font-bold text-blue-900">Old Building</h4>
                  </div>
                </div>
              )}
              {(view === 'girls-new' || view === 'girls-old' || view === 'boys') && (
                <>
                  <div className="flex space-x-4 mb-4">
                    {[1, 2, 3, 4, 5, 6].map(floor => (
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
                    {rooms.map(room => (
                      <div key={room.id} className="border rounded-lg p-4 shadow-md bg-gray-50">
                        <h4 className="text-lg font-semibold text-blue-900">Room {room.room_number}</h4>
                        <p><strong>Member 1:</strong> {room.member1_name || 'Vacant'}</p>
                        <p><strong>Member 2:</strong> {room.member2_name || 'Vacant'}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection === 'attendance' && (
            <div>
              <input
                type="text"
                value={searchAttendance}
                onChange={(e) => setSearchAttendance(e.target.value)}
                className="input-field mb-4 w-full max-w-md mx-auto block"
                placeholder="Enter student name to view attendance..."
              />
              {searchAttendance && <SuperadminAttendanceView studentName={searchAttendance} />}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Send Broadcast Notification</h3>
            <form onSubmit={handleBroadcast}>
              <textarea
                value={notification}
                onChange={(e) => setNotification(e.target.value)}
                className="input-field w-full mb-4"
                placeholder="Enter broadcast message..."
                rows="3"
                required
              />
              <button type="submit" className="button flex items-center">
                <FaPaperPlane className="mr-2" /> Send to All
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuperadminDashboard;