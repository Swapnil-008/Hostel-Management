const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Student Login
router.post('/login/student', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [students] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (students.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const student = students[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC',
      [student.id]
    );
    res.json({ ...student, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login
router.post('/login/admin', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [admins] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (admins.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    res.json({ id: admin.id, username: admin.username, email: admin.email, phoneNo: admin.phoneNo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Superadmin Login
router.post('/login/superadmin', async (req, res) => {
  console.log('Superadmin login request:', req.body);
  const { username, password } = req.body;
  try {
    const [superadmins] = await db.query('SELECT * FROM superadmins WHERE username = ?', [username]);
    console.log('DB result:', superadmins);
    if (superadmins.length === 0) {
      console.log('No superadmin found for username:', username);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const superadmin = superadmins[0];
    const isMatch = await bcrypt.compare(password, superadmin.password);
    console.log('Password from DB:', superadmin.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      console.log('Password mismatch for username:', username);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    res.json({ id: superadmin.id, username: superadmin.username, email: superadmin.email, role: 'superadmin' });
  } catch (err) {
    console.error('Superadmin login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Student Register
router.post('/register/student', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;