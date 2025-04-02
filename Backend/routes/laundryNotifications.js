const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all laundry notifications
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM laundry_notifications');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a laundry request (for students)
router.post('/', async (req, res) => {
  const { student_id, request_date } = req.body;
  try {
    await db.query('INSERT INTO laundry_notifications (student_id, request_date) VALUES (?, ?)', [student_id, request_date]);
    res.status(201).json({ message: 'Laundry request submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a laundry request (for admin)
router.put('/:id/accept', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE laundry_notifications SET status = ? WHERE id = ?', ['Accepted', id]);
    res.json({ message: 'Laundry request accepted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;