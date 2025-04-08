import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserCircle, FaEnvelope, FaHome, FaBell, FaTrash, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (user.username) {
      // Fetch admin's updated profile and notifications
      const fetchAdminProfile = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/admins/${user.id}`);
          const [notifications] = await axios.get(`http://localhost:5000/api/notifications?admin_id=${user.id}`);
          const updatedUser = { ...user, ...res.data, notifications: notifications.data };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
          console.error('Error fetching admin profile:', err);
        }
      };
      fetchAdminProfile();
    } else {
      // Fetch student's updated profile and notifications
      const fetchStudentProfile = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/students/${user.id}`);
          const [notifications] = await axios.get(`http://localhost:5000/api/notifications?student_id=${user.id}`);
          const updatedUser = { ...user, ...res.data, notifications: notifications.data };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
          console.error('Error fetching student profile:', err);
        }
      };
      fetchStudentProfile();
    }
  }, [navigate, user]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`);
      const updatedNotifications = user.notifications.filter((notification) => notification.id !== notificationId);
      const updatedUser = { ...user, notifications: updatedNotifications };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Notification deleted successfully');
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification');
    }
  };

  const extractEmailFromMessage = (message) => {
    const emailMatch = message.match(/Email: ([^\s,]+)/);
    return emailMatch ? emailMatch[1] : '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title">{user?.username ? 'Admin Profile' : 'Student Profile'}</h2>
        <div className="max-w-5xl mx-auto">
          {user && (
            <div className="profile-card">
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <FaUserCircle className="profile-avatar" />
                  <div className="profile-badge">
                    <span>{user.username ? 'A' : 'S'}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-blue-900">{user.name || user.username}</h3>
                  <p className="text-gray-600">{user.username ? 'Administrator' : 'Student'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-blue-900 text-xl" />
                  <div>
                    <p className="text-blue-900 font-medium">Email</p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                {user.username ? (
                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-blue-900 text-xl" />
                    <div>
                      <p className="text-blue-900 font-medium">Phone Number</p>
                      <p className="text-gray-600">{user.phoneNo || 'Not provided'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <FaHome className="text-blue-900 text-xl" />
                    <div>
                      <p className="text-blue-900 font-medium">Room Number</p>
                      <p className="text-gray-600">{user.room_number || 'Not assigned'}</p>
                    </div>
                  </div>
                )}
              </div>

              {user && user.notifications && user.notifications.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <FaBell className="text-blue-900 text-2xl" />
                    <h3 className="text-2xl font-semibold text-blue-900">Notifications</h3>
                  </div>
                  <div className="notification-scroll">
                    {user.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="notification-card custom-transition flex justify-between items-start m-4"
                      >
                        <div>
                          <p className="text-blue-900 font-medium">
                            {notification.notification_type} from {notification.admin_name}
                          </p>
                          <p className="text-blue-900 mt-1">{notification.message}</p>
                          {notification.notification_type === 'Room Allocation' && user.username && (
                            <Link
                              to={`/add-student?email=${extractEmailFromMessage(notification.message)}`}
                              className="text-blue-500 hover:underline mt-2 block"
                            >
                              Create Student Account
                            </Link>
                          )}
                          <p className="text-gray-500 text-sm mt-1">
                            Received: {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-300"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;