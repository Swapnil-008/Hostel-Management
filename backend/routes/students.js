const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// GET /students - Retrieve all students or search by email/name
router.get('/', async (req, res) => {
  const { email, name } = req.query;
  try {
    let query = 'SELECT id, name, email, room_number FROM students';
    const params = [];
    if (email) {
      query += ' WHERE email = $1'; // Search by exact email
      params.push(email);
    } else if (name) {
      query += ' WHERE name LIKE $1'; // Search by name pattern
      params.push(`%${name}%`);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /students - Create login credentials for existing student and notify admins
router.post('/', async (req, res) => {
  const { name, email, password, admin_id, admin_name } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    // Check if student exists in database without credentials
    const existingResult = await db.query('SELECT * FROM students WHERE email = $1 AND name = $2', [email, name]);
    if (existingResult.rows.length === 0) {
      return res.status(400).json({ error: 'Entered student\'s info is invalid' });
    }
    if (existingResult.rows[0].password) {
      return res.status(400).json({ error: 'This student\'s credentials are already generated' });
    }
    
    // Hash password and update student record
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE students SET password = $1 WHERE id = $2', [hashedPassword, existingResult.rows[0].id]);

    // Send notification to all admins about new credentials
    const adminsResult = await db.query('SELECT id FROM admins');
    for (const admin of adminsResult.rows) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, admin_name, notification_type) VALUES ($1, $2, $3, $4)',
        [
          admin.id,
          `${admin_name || 'System'} has created credentials for ${name} (${email}).`,
          admin_name || 'System',
          'Credential Creation',
        ]
      );
    }

    res.status(200).json({ message: 'Student credentials created successfully', student_id: existingResult.rows[0].id });
  } catch (err) {
    console.error('Error creating student credentials:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /students/:id - Update student's room number assignment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { room_number } = req.body;
  try {
    // Verify student exists before updating
    const existingResult = await db.query('SELECT id FROM students WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      console.error(`Student with id ${id} not found`);
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Update room number (can set to null if undefined)
    const result = await db.query(
      'UPDATE students SET room_number = $1 WHERE id = $2',
      [room_number !== undefined ? room_number : null, id]
    );
    if (result.rowCount === 0) {
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