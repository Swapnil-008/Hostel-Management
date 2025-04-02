const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  const { room_number, scheduled_date } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO room_cleaning (room_number, scheduled_date) VALUES (?, ?)',
      [room_number, scheduled_date]
    );
    const [newCleaning] = await db.query('SELECT * FROM room_cleaning WHERE id = ?', [result.insertId]);
    res.status(201).json(newCleaning[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM room_cleaning');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;