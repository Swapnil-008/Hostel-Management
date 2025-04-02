const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all hostel rules
router.get('/', async (req, res) => {
  try {
    const [rules] = await db.query('SELECT * FROM hostel_rules');
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;