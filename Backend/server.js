const express = require('express');
const cors = require('cors');
const complaintRoutes = require('./routes/complaints');
const leaveRoutes = require('./routes/leaves');
const authRoutes = require('./routes/auth');
const canteenMenuRoutes = require('./routes/canteenMenu');
const attendanceRoutes = require('./routes/attendance');
const laundryRoutes = require('./routes/laundryNotifications');
const notificationRoutes = require('./routes/notifications');
const studentRoutes = require('./routes/students');
const roomsRoutes = require('./routes/rooms');
const adminRoutes = require('./routes/admins');
const hostelDoctorsRoutes = require('./routes/hostelDoctors');
const hostelRulesRoutes = require('./routes/hostelRules');
const hostelImagesRoutes = require('./routes/hostelImages'); // New

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/complaints', complaintRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/canteen-menu', canteenMenuRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/laundry-notifications', laundryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/hostel-doctors', hostelDoctorsRoutes);
app.use('/api/hostel-rules', hostelRulesRoutes);
app.use('/api/hostel-images', hostelImagesRoutes); // New

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});