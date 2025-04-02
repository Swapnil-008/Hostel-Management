const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all students with their room numbers
router.get('/', async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT s.id, s.name, s.email, s.room_number
      FROM students s
    `);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student's room number
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { room_number } = req.body;
  try {
    const [result] = await db.query('UPDATE students SET room_number = ? WHERE id = ?', [room_number, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student room number updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;