const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /canteenMenu - Retrieve all canteen menu items
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM canteen_menu');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /canteenMenu/:id - Update canteen menu item (Admin only)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { day, menu } = req.body;
  try {
    await db.query('UPDATE canteen_menu SET day = $1, menu = $2 WHERE id = $3', [day, menu, id]);
    res.json({ message: 'Menu updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;