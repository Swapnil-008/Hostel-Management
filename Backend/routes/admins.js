const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all admins
router.get('/', async (req, res) => {
    try {
      const [admins] = await db.query('SELECT id, username, email, phoneNo FROM admins');
      res.json(admins);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Get admin profile by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [admins] = await db.query('SELECT id, username, email, phoneNo FROM admins WHERE id = ?', [id]);
    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admins[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;