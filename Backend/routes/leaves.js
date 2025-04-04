const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  const { student_id, start_date, end_date, reason } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO leaves (student_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)',
      [student_id, start_date, end_date, reason]
    );
    const [newLeave] = await db.query('SELECT * FROM leaves WHERE id = ?', [result.insertId]);
    res.status(201).json(newLeave[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, s.name AS student_name 
      FROM leaves l 
      JOIN students s ON l.student_id = s.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
      const [result] = await db.query('DELETE FROM leaves WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      return res.json({ message: 'Leave request returned and deleted successfully' });
    }

    const [result] = await db.query('UPDATE leaves SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json({ message: 'Leave request status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router