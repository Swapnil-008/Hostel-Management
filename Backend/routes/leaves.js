const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  const { student_id, start_date, end_date, reason } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO leaves (student_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)',
      [student_id, start_date, end_date, reason]
    );
    const [newLeave] = await db.query('SELECT * FROM leaves WHERE id = ?', [result.insertId]);
    res.status(201).json(newLeave[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM leaves');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;