const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/send', async (req, res) => {
  const { admin_id, message, notification_type, student_id, student_email } = req.body;
  try {
    let admin_name = 'System';
    if (admin_id) {
      const [admins] = await db.query('SELECT username FROM admins WHERE id = ?', [admin_id]);
      if (admins.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      admin_name = admins[0].username;
    }

    const [result] = await db.query(
      'INSERT INTO notifications (admin_id, message, admin_name, notification_type, student_id, student_email) VALUES (?, ?, ?, ?, ?, ?)',
      [admin_id || null, message, admin_name, notification_type, student_id || null, student_email || null]
    );
    res.status(201).json({ message: 'Notification sent successfully', notification_id: result.insertId });
  } catch (err) {
    console.error('Error sending notification:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { admin_id } = req.query;
  try {
    const [notifications] = await db.query('SELECT * FROM notifications WHERE admin_id = ? ORDER BY created_at DESC', [admin_id]);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;