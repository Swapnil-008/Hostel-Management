const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all complaints with student names
router.get('/', async (req, res) => {
  try {
    const [complaints] = await db.query(`
      SELECT c.*, s.name AS student_name 
      FROM complaints c 
      JOIN students s ON c.student_id = s.id
    `);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new complaint
router.post('/', async (req, res) => {
  const { student_id, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO complaints (student_id, description) VALUES (?, ?)',
      [student_id, description]
    );
    const [newComplaint] = await db.query('SELECT * FROM complaints WHERE id = ?', [result.insertId]);
    res.status(201).json(newComplaint[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update complaint status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['pending', 'working', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // If status is 'completed', delete the complaint
    if (status === 'completed') {
      const [result] = await db.query('DELETE FROM complaints WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      return res.json({ message: 'Complaint completed and deleted successfully' });
    }

    // Otherwise, update the status
    const [result] = await db.query(
      'UPDATE complaints SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ message: 'Complaint status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;