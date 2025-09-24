const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /complaints - Retrieve all complaints with student names
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, s.name AS student_name 
      FROM complaints c 
      JOIN students s ON c.student_id = s.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /complaints - Create a new complaint
router.post('/', async (req, res) => {
  const { student_id, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO complaints (student_id, description) VALUES ($1, $2) RETURNING *',
      [student_id, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /complaints/:id - Update complaint status (pending/working/completed)
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
      const result = await db.query('DELETE FROM complaints WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      return res.json({ message: 'Complaint completed and deleted successfully' });
    }

    // Otherwise, update the status for 'pending' or 'working'
    const result = await db.query(
      'UPDATE complaints SET status = $1 WHERE id = $2',
      [status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ message: 'Complaint status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;