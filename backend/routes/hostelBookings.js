const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /hostelBookings - Create a new hostel booking
router.post('/', async (req, res) => {
  const { student_id, room_number, booking_date, payment_amount } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO hostel_bookings (student_id, room_number, booking_date, payment_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [student_id, room_number, booking_date, payment_amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /hostelBookings - Retrieve all hostel bookings
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM hostel_bookings');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;