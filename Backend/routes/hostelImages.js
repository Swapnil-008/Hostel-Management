const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all hostel images
router.get('/', async (req, res) => {
  try {
    const [images] = await db.query('SELECT * FROM hostel_images');
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;