const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Send a notification to a student
router.post('/send', async (req, res) => {
  const { student_id, message, admin_id, notification_type } = req.body;
  try {
    // Fetch the admin's name
    const [admins] = await db.query('SELECT username FROM admins WHERE id = ?', [admin_id]);
    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    const admin_name = admins[0].username;

    // Insert the notification with admin_name and notification_type
    await db.query(
      'INSERT INTO notifications (student_id, message, admin_name, notification_type) VALUES (?, ?, ?, ?)',
      [student_id, message, admin_name, notification_type]
    );
    res.status(201).json({ message: 'Notification sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a notification by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM notifications WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;