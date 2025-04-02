const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get attendance for a student
router.get('/', async (req, res) => {
  const { student_id } = req.query;
  try {
    const [rows] = await db.query('SELECT * FROM attendance WHERE student_id = ?', [student_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark attendance (Admin only)
router.post('/mark', async (req, res) => {
  const { student_id, date, status } = req.body;
  try {
    // Check if a record already exists for this student on this date
    const [existing] = await db.query('SELECT * FROM attendance WHERE student_id = ? AND date = ?', [student_id, date]);
    if (existing.length > 0) {
      // Update the existing record
      await db.query('UPDATE attendance SET status = ? WHERE student_id = ? AND date = ?', [status, student_id, date]);
    } else {
      // Insert a new record
      await db.query('INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)', [student_id, date, status]);
    }
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;