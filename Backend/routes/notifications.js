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
  const { admin_id, student_id } = req.query;
  try {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    if (admin_id) {
      query += ' AND admin_id = ?';
      params.push(admin_id);
    }
    if (student_id) {
      query += ' AND student_id = ?';
      params.push(student_id);
    }
    query += ' ORDER BY created_at DESC';
    const [notifications] = await db.query(query, params);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.post('/broadcast', async (req, res) => {
  const { superadmin_id, message, notification_type } = req.body;
  try {
    const [superadmins] = await db.query('SELECT username FROM superadmins WHERE id = ?', [superadmin_id]);
    if (superadmins.length === 0) {
      return res.status(404).json({ error: 'Superadmin not found' });
    }
    const admin_name = superadmins[0].username;

    const [students] = await db.query('SELECT id, email FROM students');
    const [admins] = await db.query('SELECT id FROM admins');

    for (const student of students) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, admin_name, notification_type, student_id, student_email) VALUES (?, ?, ?, ?, ?, ?)',
        [null, message, admin_name, notification_type, student.id, student.email]
      );
    }

    for (const admin of admins) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, admin_name, notification_type) VALUES (?, ?, ?, ?)',
        [admin.id, message, admin_name, notification_type]
      );
    }

    res.status(201).json({ message: 'Broadcast notification sent successfully' });
  } catch (err) {
    console.error('Error sending broadcast notification:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;