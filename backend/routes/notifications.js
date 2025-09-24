const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /notifications/send - Send a notification to specific admin or student
router.post('/send', async (req, res) => {
  const { admin_id, message, notification_type, student_id, student_email } = req.body;
  try {
    let admin_name = 'System';
    if (admin_id) {
      const adminsResult = await db.query('SELECT username FROM admins WHERE id = $1', [admin_id]);
      if (adminsResult.rows.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      admin_name = adminsResult.rows[0].username;
    }

    const result = await db.query(
      'INSERT INTO notifications (admin_id, message, admin_name, notification_type, student_id, student_email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [admin_id || null, message, admin_name, notification_type, student_id || null, student_email || null]
    );
    res.status(201).json({ message: 'Notification sent successfully', notification_id: result.rows[0].id });
  } catch (err) {
    console.error('Error sending notification:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /notifications - Retrieve notifications with optional filtering by admin_id or student_id
router.get('/', async (req, res) => {
  const { admin_id, student_id } = req.query;
  try {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (admin_id) {
      paramCount++;
      query += ` AND admin_id = $${paramCount}`;
      params.push(admin_id);
    }
    if (student_id) {
      paramCount++;
      query += ` AND student_id = $${paramCount}`;
      params.push(student_id);
    }
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /notifications/:id - Delete a specific notification by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM notifications WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /notifications/broadcast - Send broadcast notification to all students and admins
router.post('/broadcast', async (req, res) => {
  const { superadmin_id, message, notification_type } = req.body;
  try {
    const superadminsResult = await db.query('SELECT username FROM superadmins WHERE id = $1', [superadmin_id]);
    if (superadminsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Superadmin not found' });
    }
    const admin_name = superadminsResult.rows[0].username;

    const studentsResult = await db.query('SELECT id, email FROM students');
    const adminsResult = await db.query('SELECT id FROM admins');

    // Send to all students
    for (const student of studentsResult.rows) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, admin_name, notification_type, student_id, student_email) VALUES ($1, $2, $3, $4, $5, $6)',
        [null, message, admin_name, notification_type, student.id, student.email]
      );
    }

    // Send to all admins
    for (const admin of adminsResult.rows) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, admin_name, notification_type) VALUES ($1, $2, $3, $4)',
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