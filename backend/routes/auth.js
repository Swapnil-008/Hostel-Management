const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// POST /auth/login/student - Student login with email and password
router.post('/login/student', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM students WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const student = result.rows[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const notificationsResult = await db.query(
      'SELECT * FROM notifications WHERE student_id = $1 ORDER BY created_at DESC',
      [student.id]
    );
    res.json({ ...student, notifications: notificationsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login/admin - Admin login with username and password
router.post('/login/admin', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    res.json({ id: admin.id, username: admin.username, email: admin.email, phoneNo: admin.phoneNo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login/superadmin - Superadmin login with username and password
router.post('/login/superadmin', async (req, res) => {
  console.log('Superadmin login request:', req.body);
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM superadmins WHERE username = $1', [username]);
    console.log('DB result:', result.rows);
    if (result.rows.length === 0) {
      console.log('No superadmin found for username:', username);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const superadmin = result.rows[0];
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

// POST /auth/register/student - Student registration with name, email, password
router.post('/register/student', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingResult = await db.query('SELECT * FROM students WHERE email = $1', [email]);
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO students (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;