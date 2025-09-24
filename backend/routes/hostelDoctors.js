const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /hostelDoctors - Retrieve the hostel doctor information (single doctor)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM hostel_doctors LIMIT 1'); // Assuming one doctor for simplicity
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No hostel doctor found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /hostelDoctors/:id - Update hostel doctor information (admin only)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_no, specialization, availability } = req.body;
  try {
    const result = await db.query(
      'UPDATE hostel_doctors SET name = $1, email = $2, phone_no = $3, specialization = $4, availability = $5 WHERE id = $6',
      [name, email, phone_no, specialization, availability, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Hostel doctor not found' });
    }
    res.json({ message: 'Hostel doctor updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;