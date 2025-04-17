const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [superadmins] = await db.query('SELECT id, username, email FROM superadmins WHERE id = ?', [id]);
    if (superadmins.length === 0) {
      return res.status(404).json({ error: 'Superadmin not found' });
    }
    res.json(superadmins[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;