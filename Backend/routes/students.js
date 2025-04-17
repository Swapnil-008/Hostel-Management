const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
  const { email, name } = req.query;
  try {
    let query = 'SELECT id, name, email, room_number FROM students';
    const params = [];
    if (email) {
      query += ' WHERE email = ?';
      params.push(email);
    } else if (name) {
      query += ' WHERE name LIKE ?';
      params.push(`%${name}%`);
    }
    const [students] = await db.query(query, params);
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, email, password, admin_id, admin_name } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const [existing] = await db.query('SELECT * FROM students WHERE email = ? AND name = ?', [email, name]);
    if (existing.length === 0) {
      return res.status(400).json({ error: 'Entered student’s info is invalid' });
    }
    if (existing[0].password) {
      return res.status(400).json({ error: 'This student’s credentials are already generated' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE students SET password = ? WHERE id = ?', [hashedPassword, existing[0].id]);

    const [admins] = await db.query('SELECT id FROM admins');
    for (const admin of admins) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, admin_name, notification_type) VALUES (?, ?, ?, ?)',
        [
          admin.id,
          `${admin_name || 'System'} has created credentials for ${name} (${email}).`,
          admin_name || 'System',
          'Credential Creation',
        ]
      );
    }

    res.status(200).json({ message: 'Student credentials created successfully', student_id: existing[0].id });
  } catch (err) {
    console.error('Error creating student credentials:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { room_number } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM students WHERE id = ?', [id]);
    if (existing.length === 0) {
      console.error(`Student with id ${id} not found`);
      return res.status(404).json({ error: 'Student not found' });
    }
    const [result] = await db.query(
      'UPDATE students SET room_number = ? WHERE id = ?',
      [room_number !== undefined ? room_number : null, id]
    );
    if (result.affectedRows === 0) {
      console.error(`No rows updated for student id ${id}`);
      return res.status(400).json({ error: 'No changes made to student' });
    }
    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    console.error(`Error updating student id ${id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;