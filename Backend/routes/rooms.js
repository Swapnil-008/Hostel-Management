const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all available rooms
router.get('/', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM rooms WHERE available = 1');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit student preferences and allocate a room
router.post('/allocate', async (req, res) => {
  const { student_id, preferred_capacity, same_state_preference, attached_washroom, gallery } = req.body;
  try {
    // Find a matching room
    let query = 'SELECT * FROM rooms WHERE available = 1 AND capacity = ?';
    const params = [preferred_capacity];

    if (attached_washroom !== undefined) {
      query += ' AND has_washroom = ?';
      params.push(attached_washroom ? 1 : 0);
    }
    if (gallery !== undefined) {
      query += ' AND has_gallery = ?';
      params.push(gallery ? 1 : 0);
    }

    const [rooms] = await db.query(query, params);

    if (rooms.length === 0) {
      return res.status(404).json({ error: 'No matching rooms available' });
    }

    // For same state preference, we need to check if other students in the room are from the same state
    const student = (await db.query('SELECT state FROM students WHERE id = ?', [student_id]))[0][0];
    let selectedRoom = rooms[0]; // Default to the first matching room

    if (same_state_preference) {
      // Check if the room is already partially allocated
      const [existingPrefs] = await db.query(
        'SELECT student_id FROM room_preferences WHERE allocated_room_id = ?',
        [selectedRoom.id]
      );
      if (existingPrefs.length > 0) {
        const studentIds = existingPrefs.map((pref) => pref.student_id);
        const [roommates] = await db.query('SELECT state FROM students WHERE id IN (?)', [studentIds]);
        const allSameState = roommates.every((roommate) => roommate.state === student.state);
        if (!allSameState) {
          return res.status(404).json({ error: 'No matching rooms with same state roommates available' });
        }
      }
    }

    // Allocate the room to the student
    await db.query(
      'INSERT INTO room_preferences (student_id, preferred_capacity, same_state_preference, attached_washroom, gallery, allocated_room_id) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, preferred_capacity, same_state_preference ? 1 : 0, attached_washroom ? 1 : 0, gallery ? 1 : 0, selectedRoom.id]
    );

    // Check if the room is now fully allocated
    const [allocations] = await db.query(
      'SELECT COUNT(*) as count FROM room_preferences WHERE allocated_room_id = ?',
      [selectedRoom.id]
    );
    if (allocations[0].count >= selectedRoom.capacity) {
      await db.query('UPDATE rooms SET available = 0 WHERE id = ?', [selectedRoom.id]);
    }

    res.json({ message: 'Room allocated successfully', room: selectedRoom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;