const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /admins - Retrieve all admins (without passwords for security)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, email, phoneNo FROM admins');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admins/:id - Retrieve specific admin by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT id, username, email, phoneNo FROM admins WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;