import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import ComplaintForm from './components/ComplaintForm';
import LeaveForm from './components/LeaveForm';
import LaundryForm from './components/LaundryForm';
import AttendanceView from './components/AttendanceView';
import CanteenMenuView from './components/CanteenMenuView';
import Profile from './pages/Profile';
import AdminComplaintsView from './components/AdminComplaintsView';
import AdminLeavesView from './components/AdminLeavesView';
import RoomAllocation from './components/RoomAllocation';
import AdminRoomAllocation from './pages/AdminRoomAllocation';
import SendNotification from './pages/SendNotification'; // New
import AddStudent from './pages/AddStudent';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/student" element={<Login role="student" />} />
          <Route path="/login/admin" element={<Login role="admin" />} />
          <Route path="/register/student" element={<Register role="student" />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/complaints" element={<ComplaintForm />} />
          <Route path="/leaves" element={<LeaveForm />} />
          <Route path="/laundry" element={<LaundryForm />} />
          <Route path="/attendance" element={<AttendanceView />} />
          <Route path="/canteen-menu" element={<CanteenMenuView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin-complaints" element={<AdminComplaintsView />} />
          <Route path="/admin-leaves" element={<AdminLeavesView />} />
          <Route path="/room-allocation" element={<RoomAllocation />} />
          <Route path="/admin-room-allocation" element={<AdminRoomAllocation />} />
          <Route path="/send-notification" element={<SendNotification />} /> {/* New */}
          <Route path="/add-student" element={<AddStudent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;