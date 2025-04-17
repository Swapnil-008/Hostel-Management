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
  console.log('Reserve request:', { room_id, user_name, user_email, user_phone });
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
  const { reservation_id, user_name, user_email, user_phone, payment_id } = req.body;
  console.log('Confirm payment request:', { reservation_id, user_name, user_email, user_phone, payment_id });
  try {
    const [reservation] = await db.query(
      'SELECT * FROM reservations WHERE id = ? AND student_name = ? AND status = "pending"',
      [reservation_id, user_name]
    );
    console.log('Reservation data:', reservation[0]);
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
    const [existingStudent] = await db.query('SELECT id, password, room_number FROM students WHERE email = ?', [reservation[0].student_email]);
    if (existingStudent.length > 0) {
      if (existingStudent[0].password) {
        return res.status(400).json({ error: 'Student credentials already exist' });
      }
      if (existingStudent[0].room_number) {
        return res.status(400).json({ error: `Student is already assigned to ${existingStudent[0].room_number}` });
      }
      studentId = existingStudent[0].id;
    } else {
      const [studentResult] = await db.query(
        'INSERT INTO students (name, email, room_number, password) VALUES (?, ?, ?, NULL)',
        [
          user_name,
          reservation[0].student_email,
          `${room[0].hostel_type} ${room[0].building_type || ''} Room ${room[0].room_number}`,
        ]
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

    const phoneNumber = user_phone ?? reservation[0].user_phone ?? 'N/A';
    console.log('Phone number used:', phoneNumber);
    const [admins] = await db.query('SELECT id FROM admins');
    for (const admin of admins) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, admin_name, notification_type) VALUES (?, ?, ?, ?)',
        [
          admin.id,
          `${user_name} completed their payment (${reservation[0].student_email}, ${phoneNumber}) for ${room[0].hostel_type} ${room[0].building_type || ''} Room ${room[0].room_number}.`,
          'System',
          'Payment Completion',
        ]
      );
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

router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { member1_id, member2_id } = req.body;
  try {
    const [room] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (room.length === 0) {
      console.error(`Room with id ${id} not found`);
      return res.status(404).json({ error: 'Room not found' });
    }

    if (member1_id !== undefined && member1_id !== null) {
      const [existingRoom1] = await db.query(
        'SELECT id, room_number FROM rooms WHERE (member1_id = ? OR member2_id = ?) AND id != ?',
        [member1_id, member1_id, id]
      );
      if (existingRoom1.length > 0) {
        return res.status(400).json({
          error: `Student is already assigned to ${existingRoom1[0].room_number}. Remove them first.`
        });
      }
    }
    if (member2_id !== undefined && member2_id !== null) {
      const [existingRoom2] = await db.query(
        'SELECT id, room_number FROM rooms WHERE (member1_id = ? OR member2_id = ?) AND id != ?',
        [member2_id, member2_id, id]
      );
      if (existingRoom2.length > 0) {
        return res.status(400).json({
          error: `Student is already assigned to ${existingRoom2[0].room_number}. Remove them first.`
        });
      }
    }

    if (room[0].member1_id && member1_id === null) {
      await db.query('UPDATE students SET room_number = NULL WHERE id = ?', [room[0].member1_id]);
    }
    if (room[0].member2_id && member2_id === null) {
      await db.query('UPDATE students SET room_number = NULL WHERE id = ?', [room[0].member2_id]);
    }

    const [result] = await db.query(
      'UPDATE rooms SET member1_id = ?, member2_id = ? WHERE id = ?',
      [member1_id !== undefined ? member1_id : room[0].member1_id, 
       member2_id !== undefined ? member2_id : room[0].member2_id, 
       id]
    );
    if (result.affectedRows === 0) {
      console.error(`No changes made to room id ${id}`);
      return res.status(400).json({ error: 'No changes made to the room' });
    }
    res.json({ message: 'Room updated successfully' });
  } catch (err) {
    console.error(`Error updating room id ${id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;