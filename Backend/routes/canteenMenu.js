const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get canteen menu
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM canteen_menu');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update canteen menu (Admin only)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { day, menu } = req.body;
  try {
    await db.query('UPDATE canteen_menu SET day = ?, menu = ? WHERE id = ?', [day, menu, id]);
    res.json({ message: 'Menu updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;