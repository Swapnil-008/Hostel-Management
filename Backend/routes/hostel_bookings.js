const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  const { student_id, room_number, booking_date, payment_amount } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO hostel_bookings (student_id, room_number, booking_date, payment_amount) VALUES (?, ?, ?, ?)',
      [student_id, room_number, booking_date, payment_amount]
    );
    const [newBooking] = await db.query('SELECT * FROM hostel_bookings WHERE id = ?', [result.insertId]);
    res.status(201).json(newBooking[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hostel_bookings');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;