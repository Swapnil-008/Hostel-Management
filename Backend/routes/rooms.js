const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const { hostel_type, building_type, floor } = req.query;
  try {
    await db.query('DELETE FROM reservations WHERE expires_at < ? AND status = "pending"', [new Date()]);
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
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/check-reservation/:room_id', async (req, res) => {
  const { room_id } = req.params;
  try {
    const [existing] = await db.query(
      'SELECT * FROM reservations WHERE room_id = ? AND status = "pending" AND expires_at > ?',
      [room_id, new Date()]
    );
    res.json({ isReserved: existing.length > 0 });
  } catch (err) {
    console.error('Error checking reservation:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/reserve', async (req, res) => {
  const { room_id, user_name, user_email, user_phone } = req.body;
  if (!room_id || !user_name || !user_email || !user_phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const [room] = await db.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    const occupiedSeats = (room[0].member1_id ? 1 : 0) + (room[0].member2_id ? 1 : 0);
    if (occupiedSeats >= room[0].capacity) {
      return res.status(400).json({ error: 'Room is fully occupied' });
    }
    const [existing] = await db.query(
      'SELECT * FROM reservations WHERE room_id = ? AND status = "pending" AND expires_at > ?',
      [room_id, new Date()]
    );
    if (occupiedSeats + existing.length >= room[0].capacity) {
      return res.status(400).json({ error: 'All seats are reserved or occupied' });
    }
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const amount = room[0].rent_per_person || (room[0].building_type === 'New' ? 8000 : 7000);
    const [result] = await db.query(
      'INSERT INTO reservations (room_id, student_name, student_email, user_phone, reserved_at, expires_at, status, amount, hostel_type, building_type, floor, room_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        room_id,
        user_name,
        user_email,
        user_phone,
        new Date(),
        expiresAt,
        'pending',
        amount,
        room[0].hostel_type,
        room[0].building_type,
        room[0].floor,
        room[0].room_number,
      ]
    );
    res.json({
      reservation_id: result.insertId,
      user_name,
      user_email,
      user_phone,
      expires_at: expiresAt,
      amount,
      room_number: room[0].room_number,
    });
  } catch (err) {
    console.error('Error reserving room:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/confirm-payment', async (req, res) => {
  const { reservation_id, user_name, payment_id } = req.body;
  try {
    const [reservation] = await db.query(
      'SELECT * FROM reservations WHERE id = ? AND student_name = ? AND status = "pending"',
      [reservation_id, user_name]
    );
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
    if (!room[0] || (room[0].member1_id && room[0].member2_id)) {
      await db.query('DELETE FROM reservations WHERE id = ?', [reservation_id]);
      return res.status(400).json({ error: 'Room is no longer available' });
    }
    let studentId = null;
    const [existingStudent] = await db.query('SELECT id FROM students WHERE email = ?', [reservation[0].student_email]);
    if (existingStudent.length > 0) {
      studentId = existingStudent[0].id;
    } else {
      const [studentResult] = await db.query(
        'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
        [user_name, reservation[0].student_email, require('bcrypt').hashSync('default_password', 10)]
      );
      studentId = studentResult.insertId;
    }
    const memberField = !room[0].member1_id ? 'member1_id' : 'member2_id';
    await db.query(`UPDATE rooms SET ${memberField} = ? WHERE id = ?`, [studentId, roomId]);
    await db.query('UPDATE students SET room_number = ? WHERE id = ?', [
      `${room[0].hostel_type} ${room[0].building_type || ''} Room ${room[0].room_number}`,
      studentId,
    ]);
    await db.query(
      'INSERT INTO payments (student_id, payment_id, amount, status) VALUES (?, ?, ?, ?)',
      [studentId, payment_id, reservation[0].amount, 'completed']
    );
    await db.query('DELETE FROM reservations WHERE id = ?', [reservation_id]);
    const [admins] = await db.query('SELECT id FROM admins LIMIT 1');
    if (admins.length > 0) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, notification_type) VALUES (?, ?, ?)',
        [
          admins[0].id,
          `Student ${user_name} (${reservation[0].student_email}, ${reservation[0].user_phone}) has completed payment for ${room[0].hostel_type} ${room[0].building_type || ''} Room ${room[0].room_number}. Please create their credentials.`,
          'Room Allocation',
        ]
      );
    } else {
      console.warn('No admins found; notification not sent.');
    }
    res.json({ message: 'Payment successful! Admin will create your credentials soon.' });
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/cancel-reservation', async (req, res) => {
  const { reservation_id, user_name } = req.body;
  try {
    const [reservation] = await db.query(
      'SELECT * FROM reservations WHERE id = ? AND student_name = ? AND status = "pending"',
      [reservation_id, user_name]
    );
    if (reservation.length === 0) {
      return res.status(400).json({ error: 'Invalid reservation' });
    }
    await db.query('DELETE FROM reservations WHERE id = ?', [reservation_id]);
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling reservation:', err);
    res.status(500).json({ error: err.message });
  }
});

// New route to update room members
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { member1_id, member2_id } = req.body;
  try {
    const [room] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    const [result] = await db.query(
      'UPDATE rooms SET member1_id = ?, member2_id = ? WHERE id = ?',
      [member1_id !== undefined ? member1_id : room[0].member1_id, 
       member2_id !== undefined ? member2_id : room[0].member2_id, 
       id]
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'No changes made to the room' });
    }
    res.json({ message: 'Room updated successfully' });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;