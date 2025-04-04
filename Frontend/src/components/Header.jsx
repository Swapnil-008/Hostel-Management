import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="bg-blue-900 text-white py-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <Link
          to={user ? (user.username ? '/admin-dashboard' : '/dashboard') : '/'}
          className="text-2xl font-bold"
        >
          Hostel Management
        </Link>
        <nav className="space-x-4 flex items-center">
          {user ? (
            <>
              {user.username ? (
                // Admin Links
                <>
                  <Link to="/admin-dashboard" className="hover:text-blue-300 transition-colors duration-300">
                    Dashboard
                  </Link>
                  <Link to="/send-notification" className="hover:text-blue-300 transition-colors duration-300">
                    Send Notification
                  </Link>
                  <Link to="/add-student" className="hover:text-blue-300 transition-colors duration-300">
                    Add Student
                  </Link>
                  <Link to="/profile" className="hover:text-blue-300 transition-colors duration-300">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-blue-300 transition-colors duration-300"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                // Student Links
                <>
                  <Link to="/dashboard" className="hover:text-blue-300 transition-colors duration-300">
                    Dashboard
                  </Link>
                  <Link to="/community" className="hover:text-blue-300 transition-colors duration-300">
                    Community
                  </Link>
                  <Link to="/profile" className="hover:text-blue-300 transition-colors duration-300">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-blue-300 transition-colors duration-300"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </>
          ) : (
            // Links for unauthenticated users
            <>
              <Link to="/login/admin" className="hover:text-blue-300 transition-colors duration-300">
                Admin Login
              </Link>
              <Link to="/login/student" className="hover:text-blue-300 transition-colors duration-300">
                Student Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;