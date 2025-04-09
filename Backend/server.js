const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
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
const hostelImagesRoutes = require('./routes/hostelImages');

dotenv.config();

const app = express();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_9Q6Lg9fdFP0HHi',
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
app.use('/api/hostel-images', hostelImagesRoutes);

app.post('/api/payments/order', async (req, res) => {
  const { amount, currency = 'INR', receipt = 'receipt_' + Date.now() } = req.body;
  try {
    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const crypto = require('crypto');
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Something went wrong on the server', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});