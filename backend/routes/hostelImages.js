const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /hostelImages - Retrieve all hostel images with captions
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM hostel_images');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;