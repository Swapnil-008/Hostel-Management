const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /leaves - Create a new leave application for a student
router.post('/', async (req, res) => {
  const { student_id, start_date, end_date, reason } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO leaves (student_id, start_date, end_date, reason) VALUES ($1, $2, $3, $4) RETURNING *',
      [student_id, start_date, end_date, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /leaves - Retrieve all leave applications with student names
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, s.name AS student_name 
      FROM leaves l 
      JOIN students s ON l.student_id = s.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /leaves/:id - Update leave request status (approve/reject/return)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(`Received PUT request for /api/leaves/${id} with status: ${status}`);
  
  const validStatuses = ['pending', 'approved', 'returned'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    if (status === 'returned') {
      // Delete leave request when status is 'returned'
      const result = await db.query('DELETE FROM leaves WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      return res.json({ message: 'Leave request returned and deleted successfully' });
    }

    // Update leave status for 'pending' or 'approved'
    const result = await db.query('UPDATE leaves SET status = $1 WHERE id = $2', [status, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json({ message: 'Leave request status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;