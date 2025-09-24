const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /superadmins/:id - Retrieve specific superadmin details by ID (excludes password)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT id, username, email FROM superadmins WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Superadmin not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;