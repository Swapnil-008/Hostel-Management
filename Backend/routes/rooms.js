const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all rooms (with cleanup of expired reservations)
router.get('/', async (req, res) => {
  console.log('Received GET request to /api/rooms with query:', req.query);
  const { hostel_type, building_type, floor } = req.query;
  try {
    // Clean up expired reservations
    const [deleted] = await db.query(
      'DELETE FROM reservations WHERE expires_at < ? AND status = "pending"',
      [new Date()]
    );
    console.log('Deleted expired reservations:', deleted.affectedRows);

    let query = `
      SELECT r.*, s1.name AS member1_name, s2.name AS member2_name
      FROM rooms r
      LEFT JOIN students s1 ON r.member1_id = s1.id
      LEFT JOIN students s2 ON r.member2_id = s2.id
      WHERE 1=1
    `;
    const params = [];
    if (hostel_type) {
      query += ' AND r.hostel_type = ?';
      params.push(hostel_type);
    }
    if (building_type) {
      query += ' AND r.building_type = ?';
      params.push(building_type);
    }
    if (floor) {
      query += ' AND r.floor = ?';
      params.push(parseInt(floor));
    }
    query += ' ORDER BY r.floor, r.room_number';

    console.log('Executing query:', query, 'with params:', params);
    const [rows] = await db.query(query, params);
    console.log('Query result:', rows);
    res.json(rows);
  } catch (err) {
    console.error('Error in /api/rooms:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Check the number of active reservations for a room
router.get('/check-reservation/:room_id', async (req, res) => {
  const { room_id } = req.params;
  try {
    const [existing] = await db.query(
      'SELECT * FROM reservations WHERE room_id = ? AND status = "pending" AND expires_at > ?',
      [room_id, new Date()]
    );
    res.json({ pendingReservations: existing.length });
  } catch (err) {
    console.error('Error in /check-reservation:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reserve a seat (30-minute reservation)
router.post('/reserve', async (req, res) => {
  const { room_id, user_name, user_email, user_phone } = req.body;
  console.log('Received reservation request:', req.body);

  // Validate required fields
  if (!room_id || !user_name || !user_email || !user_phone) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({ error: 'All fields (room_id, user_name, user_email, user_phone) are required' });
  }

  try {
    // Check if the room exists
    const [room] = await db.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    console.log('Room existence check:', room);
    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if the room has at least one vacant seat
    const occupiedSeats = (room[0].member1_id ? 1 : 0) + (room[0].member2_id ? 1 : 0);
    if (occupiedSeats >= 2) {
      console.log('Room is not available: Both seats are occupied');
      return res.status(400).json({ error: 'Room is not available for reservation' });
    }

    // Check for existing reservations for this room
    const [existing] = await db.query(
      'SELECT * FROM reservations WHERE room_id = ? AND status = "pending" AND expires_at > ?',
      [room_id, new Date()]
    );
    console.log('Existing reservations check:', existing);

    // Calculate total seats taken (occupied + reserved)
    const totalSeatsTaken = occupiedSeats + existing.length;
    if (totalSeatsTaken >= 2) {
      return res.status(400).json({ error: 'All seats are currently reserved or occupied' });
    }

    // Create a reservation (expires in 30 minutes)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    const [result] = await db.query(
      'INSERT INTO reservations (room_id, user_name, user_email, user_phone, reserved_at, expires_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [room_id, user_name, user_email, user_phone, new Date(), expiresAt, 'pending']
    );
    console.log('Reservation created:', result);
    res.json({ reservation_id: result.insertId, user_name, user_email, user_phone, expires_at: expiresAt });
  } catch (err) {
    console.error('Error in /reserve:', err);
    res.status(500).json({ error: err.message });
  }
});

// Confirm payment and allocate room
router.post('/confirm-payment', async (req, res) => {
  const { reservation_id, user_name } = req.body;
  console.log('Received payment confirmation request:', req.body);

  try {
    // Check reservation
    const [reservation] = await db.query(
      'SELECT * FROM reservations WHERE id = ? AND user_name = ? AND status = "pending"',
      [reservation_id, user_name]
    );
    console.log('Reservation check:', reservation);
    if (reservation.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reservation' });
    }

    const now = new Date();
    if (new Date(reservation[0].expires_at) < now) {
      await db.query('DELETE FROM reservations WHERE id = ?', [reservation_id]);
      return res.status(400).json({ error: 'Reservation has expired' });
    }

    const roomId = reservation[0].room_id;
    const [room] = await db.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    console.log('Room check before payment:', room);
    if (!room[0] || (room[0].member1_id && room[0].member2_id)) {
      await db.query('DELETE FROM reservations WHERE id = ?', [reservation_id]);
      return res.status(400).json({ error: 'Room is no longer available' });
    }

    // Delete the reservation record after successful payment
    await db.query('DELETE FROM reservations WHERE id = ?', [reservation_id]);
    console.log('Reservation deleted after payment:', reservation_id);

    // Notify admin with email and phone number
    const [admins] = await db.query('SELECT id FROM admins LIMIT 1'); // Notify the first admin
    if (admins.length > 0) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, notification_type) VALUES (?, ?, ?)',
        [
          admins[0].id,
          `User ${user_name} has completed payment for ${room[0].hostel_type} ${room[0].building_type || ''} Room ${room[0].room_number}. Email: ${reservation[0].user_email}, Phone: ${reservation[0].user_phone}. Please create their credentials.`,
          'Room Allocation'
        ]
      );
      console.log('Notification sent to admin:', admins[0].id);
    }

    res.json({ message: 'Payment successful! Admin will create your credentials soon.' });
  } catch (err) {
    console.error('Error in /confirm-payment:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update room allocation (for admin to change rooms)
router.put('/update/:room_id', async (req, res) => {
  const { room_id } = req.params;
  const { member1_id, member2_id } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE rooms SET member1_id = ?, member2_id = ? WHERE id = ?',
      [member1_id || null, member2_id || null, room_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Update room_number for students
    const [room] = await db.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (member1_id) {
      await db.query('UPDATE students SET room_number = ? WHERE id = ?', [
        `${room[0].hostel_type} ${room[0].building_type || ''} Room ${room[0].room_number}`,
        member1_id
      ]);
    }
    if (member2_id) {
      await db.query('UPDATE students SET room_number = ? WHERE id = ?', [
        `${room[0].hostel_type} ${room[0].building_type || ''} Room ${room[0].room_number}`,
        member2_id
      ]);
    }

    res.json({ message: 'Room allocation updated successfully', room: room[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;