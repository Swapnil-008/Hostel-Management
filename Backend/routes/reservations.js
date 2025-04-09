const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  const { student_name, student_email, hostel_type, building_type, floor, room_number, amount, expires_at } = req.body;
  console.log('Received reservation request:', req.body);

  if (!student_name || !student_email || !hostel_type || !room_number || !amount || !expires_at) {
    return res.status(400).json({ error: 'All required fields (student_name, student_email, hostel_type, room_number, amount, expires_at) are required' });
  }

  try {
    const [room] = await db.query('SELECT * FROM rooms WHERE room_number = ?', [room_number]);
    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const occupiedSeats = (room[0].member1_id ? 1 : 0) + (room[0].member2_id ? 1 : 0);
    if (occupiedSeats >= room[0].capacity) {
      return res.status(400).json({ error: 'Room is fully occupied' });
    }

    const [existing] = await db.query(
      'SELECT COUNT(*) as pendingCount FROM reservations WHERE room_number = ? AND status = "pending" AND expires_at > ?',
      [room_number, new Date()]
    );
    if (existing[0].pendingCount >= room[0].capacity - occupiedSeats) {
      return res.status(400).json({ error: 'All seats are reserved or occupied' });
    }

    const [result] = await db.query(
      'INSERT INTO reservations (student_name, student_email, hostel_type, building_type, floor, room_number, amount, expires_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_name, student_email, hostel_type, building_type || null, floor, room_number, amount, expires_at, 'pending']
    );
    const reservation = {
      id: result.insertId,
      student_name,
      student_email,
      hostel_type,
      building_type,
      floor,
      room_number,
      amount,
      expires_at: expires_at,
    };
    console.log('Reservation created:', reservation);
    res.status(201).json(reservation);
  } catch (err) {
    console.error('Error in /reserve:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:reservation_id', async (req, res) => {
  const { reservation_id } = req.params;
  const { payment_id, status } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE reservations SET payment_id = ?, status = ? WHERE id = ?',
      [payment_id || null, status || 'pending', reservation_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const [reservation] = await db.query('SELECT * FROM reservations WHERE id = ?', [reservation_id]);
    const [room] = await db.query('SELECT * FROM rooms WHERE room_number = ?', [reservation[0].room_number]);

    if (status === 'completed' && !room[0].member1_id) {
      await db.query('UPDATE rooms SET member1_id = (SELECT id FROM students WHERE email = ?) WHERE room_number = ?', [
        reservation[0].student_email,
        room[0].room_number,
      ]);
    } else if (status === 'completed' && !room[0].member2_id) {
      await db.query('UPDATE rooms SET member2_id = (SELECT id FROM students WHERE email = ?) WHERE room_number = ?', [
        reservation[0].student_email,
        room[0].room_number,
      ]);
    }

    await db.query(
      'INSERT INTO notifications (message, notification_type, recipient_email, created_at) VALUES (?, ?, ?, ?)',
      [
        `Student ${reservation[0].student_name} (${reservation[0].student_email}) has completed payment for Room ${room[0].room_number}. Please create their credentials.`,
        'admin',
        'admin@example.com',
        new Date(),
      ]
    );

    res.json({ success: true, message: 'Reservation updated' });
  } catch (err) {
    console.error('Error in /:reservation_id:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:reservation_id', async (req, res) => {
  const { reservation_id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM reservations WHERE id = ?', [reservation_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (err) {
    console.error('Error in /:reservation_id:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;