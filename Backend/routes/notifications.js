const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Send a notification to a student or admin
router.post('/send', async (req, res) => {
  const { student_id, admin_id, message, notification_type } = req.body;
  try {
    let admin_name = 'System'; // Default for system-generated notifications
    if (req.body.admin_id) {
      const [admins] = await db.query('SELECT username FROM admins WHERE id = ?', [admin_id]);
      if (admins.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      admin_name = admins[0].username;
    }

    // Insert the notification
    await db.query(
      'INSERT INTO notifications (student_id, admin_id, message, admin_name, notification_type) VALUES (?, ?, ?, ?, ?)',
      [student_id || null, admin_id || null, message, admin_name, notification_type]
    );
    console.log(`Notification sent - Student ID: ${student_id}, Admin ID: ${admin_id}, Type: ${notification_type}`);
    res.status(201).json({ message: 'Notification sent successfully' });
  } catch (err) {
    console.error('Error sending notification:', err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch notifications for a student or admin
router.get('/', async (req, res) => {
  const { student_id, admin_id } = req.query;
  try {
    let query = 'SELECT * FROM notifications WHERE ';
    const params = [];
    if (student_id) {
      query += 'student_id = ?';
      params.push(student_id);
    } else if (admin_id) {
      query += 'admin_id = ?';
      params.push(admin_id);
    } else {
      return res.status(400).json({ error: 'Student ID or Admin ID required' });
    }
    query += ' ORDER BY created_at DESC';

    const [notifications] = await db.query(query, params);
    res.json(notifications);
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