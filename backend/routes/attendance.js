const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /attendance - Retrieve attendance records for a specific student
router.get('/', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) {
    return res.status(400).json({ error: 'student_id is required' });
  }
  try {
    const result = await db.query('SELECT * FROM attendance WHERE student_id = $1', [student_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /attendance/mark - Mark or update attendance (Admin only)
router.post('/mark', async (req, res) => {
  const { student_id, date, status } = req.body;
  if (!student_id || !date || !status) {
    return res.status(400).json({ error: 'student_id, date, and status are required' });
  }
  try {
    const existingResult = await db.query('SELECT * FROM attendance WHERE student_id = $1 AND date = $2', [student_id, date]);
    if (existingResult.rows.length > 0) {
      // Update existing attendance record
      await db.query('UPDATE attendance SET status = $1 WHERE student_id = $2 AND date = $3', [status, student_id, date]);
      res.json({ message: 'Attendance updated successfully' });
    } else {
      // Create new attendance record
      await db.query('INSERT INTO attendance (student_id, date, status) VALUES ($1, $2, $3)', [student_id, date, status]);
      res.status(201).json({ message: 'Attendance marked successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;