const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  const { student_id, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO complaints (student_id, description) VALUES (?, ?)',
      [student_id, description]
    );
    const [newComplaint] = await db.query('SELECT * FROM complaints WHERE id = ?', [result.insertId]);
    res.status(201).json(newComplaint[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM complaints');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;