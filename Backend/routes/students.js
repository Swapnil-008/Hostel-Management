const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Get all students
router.get('/', async (req, res) => {
  try {
    const [students] = await db.query('SELECT id, name, email, room_number FROM students');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [students] = await db.query('SELECT id, name, email, room_number FROM students WHERE id = ?', [id]);
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(students[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new student (for admin)
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: 'Student created successfully', student_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student (e.g., room_number)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { room_number } = req.body;
  try {
    const [result] = await db.query('UPDATE students SET room_number = ? WHERE id = ?', [room_number, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;