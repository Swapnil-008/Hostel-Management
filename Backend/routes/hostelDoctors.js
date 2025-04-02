const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get hostel doctor
router.get('/', async (req, res) => {
  try {
    const [doctors] = await db.query('SELECT * FROM hostel_doctors LIMIT 1'); // Assuming one doctor for simplicity
    if (doctors.length === 0) {
      return res.status(404).json({ error: 'No hostel doctor found' });
    }
    res.json(doctors[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update hostel doctor (admin only)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_no, specialization, availability } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE hostel_doctors SET name = ?, email = ?, phone_no = ?, specialization = ?, availability = ? WHERE id = ?',
      [name, email, phone_no, specialization, availability, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel doctor not found' });
    }
    res.json({ message: 'Hostel doctor updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;