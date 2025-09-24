const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /hostelRules - Retrieve all hostel rules
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM hostel_rules');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;