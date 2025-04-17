const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get attendance for a student by student_id
router.get('/', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) {
    return res.status(400).json({ error: 'student_id is required' });
  }
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
  if (!student_id || !date || !status) {
    return res.status(400).json({ error: 'student_id, date, and status are required' });
  }
  try {
    const [existing] = await db.query('SELECT * FROM attendance WHERE student_id = ? AND date = ?', [student_id, date]);
    if (existing.length > 0) {
      await db.query('UPDATE attendance SET status = ? WHERE student_id = ? AND date = ?', [status, student_id, date]);
      res.json({ message: 'Attendance updated successfully' });
    } else {
      await db.query('INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)', [student_id, date, status]);
      res.status(201).json({ message: 'Attendance marked successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;