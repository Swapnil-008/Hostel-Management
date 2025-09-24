const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /laundryNotifications - Retrieve all laundry notifications
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM laundry_notifications');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /laundryNotifications - Submit a new laundry request (student functionality)
router.post('/', async (req, res) => {
  const { student_id, request_date } = req.body;
  try {
    await db.query('INSERT INTO laundry_notifications (student_id, request_date) VALUES ($1, $2)', [student_id, request_date]);
    res.status(201).json({ message: 'Laundry request submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /laundryNotifications/:id/accept - Accept a laundry request (admin functionality)
router.put('/:id/accept', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE laundry_notifications SET status = $1 WHERE id = $2', ['Accepted', id]);
    res.json({ message: 'Laundry request accepted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;