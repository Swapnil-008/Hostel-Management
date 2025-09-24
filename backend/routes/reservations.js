const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /reservations - Create a new hostel room reservation
router.post('/', async (req, res) => {
  const { student_name, student_email, user_phone, hostel_type, building_type, floor, room_number, amount, expires_at } = req.body;
  console.log('Received reservation request:', req.body);

  if (!student_name || !student_email || !user_phone || !hostel_type || !room_number || !amount || !expires_at) {
    return res.status(400).json({ error: 'All required fields (student_name, student_email, user_phone, hostel_type, room_number, amount, expires_at) are required' });
  }

  try {
    const roomResult = await db.query('SELECT * FROM rooms WHERE room_number = $1', [room_number]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];
    const occupiedSeats = (room.member1_id ? 1 : 0) + (room.member2_id ? 1 : 0);
    if (occupiedSeats >= room.capacity) {
      return res.status(400).json({ error: 'Room is fully occupied' });
    }

    const existingResult = await db.query(
      'SELECT COUNT(*) as pending_count FROM reservations WHERE room_number = $1 AND status = $2 AND expires_at > $3',
      [room_number, 'pending', new Date()]
    );
    if (parseInt(existingResult.rows[0].pending_count) >= room.capacity - occupiedSeats) {
      return res.status(400).json({ error: 'All seats are reserved or occupied' });
    }

    const result = await db.query(
      'INSERT INTO reservations (student_name, student_email, user_phone, hostel_type, building_type, floor, room_number, amount, expires_at, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [student_name, student_email, user_phone, hostel_type, building_type || null, floor, room_number, amount, expires_at, 'pending']
    );
    
    const reservation = result.rows[0];
    console.log('Reservation created:', reservation);
    res.status(201).json(reservation);
  } catch (err) {
    console.error('Error in /reserve:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /reservations/:reservation_id - Update reservation status and process payment completion
router.put('/:reservation_id', async (req, res) => {
  const { reservation_id } = req.params;
  const { payment_id, status, student_name, student_email, user_phone } = req.body;
  try {
    const result = await db.query(
      'UPDATE reservations SET payment_id = $1, status = $2 WHERE id = $3 RETURNING *',
      [payment_id || null, status || 'pending', reservation_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (status === 'completed') {
      const reservationResult = await db.query('SELECT * FROM reservations WHERE id = $1', [reservation_id]);
      const reservation = reservationResult.rows[0];
      
      const roomResult = await db.query('SELECT * FROM rooms WHERE room_number = $1', [reservation.room_number]);
      const room = roomResult.rows[0];

      let studentId = null;
      const existingStudentResult = await db.query('SELECT id, password FROM students WHERE email = $1', [student_email]);
      if (existingStudentResult.rows.length > 0) {
        if (existingStudentResult.rows[0].password) {
          return res.status(400).json({ error: 'Student credentials already exist' });
        }
        studentId = existingStudentResult.rows[0].id;
      } else {
        const studentResult = await db.query(
          'INSERT INTO students (name, email, room_number) VALUES ($1, $2, $3) RETURNING id',
          [
            student_name,
            student_email,
            `${room.hostel_type} ${room.building_type || ''} Room ${room.room_number}`,
          ]
        );
        studentId = studentResult.rows[0].id;
      }

      if (!room.member1_id) {
        await db.query('UPDATE rooms SET member1_id = $1 WHERE room_number = $2', [studentId, room.room_number]);
      } else if (!room.member2_id) {
        await db.query('UPDATE rooms SET member2_id = $1 WHERE room_number = $2', [studentId, room.room_number]);
      }

      await db.query('UPDATE students SET room_number = $1 WHERE id = $2', [
        `${room.hostel_type} ${room.building_type || ''} Room ${room.room_number}`,
        studentId,
      ]);

      // Notify all admins about completed payment
      const adminsResult = await db.query('SELECT id FROM admins');
      for (const admin of adminsResult.rows) {
        await db.query(
          'INSERT INTO notifications (admin_id, message, admin_name, notification_type) VALUES ($1, $2, $3, $4)',
          [
            admin.id,
            `${student_name} completed their payment (${student_email}, ${user_phone}) for ${room.hostel_type} ${room.building_type || ''} Room ${room.room_number}.`,
            'System',
            'Payment Completion',
          ]
        );
      }
    }

    res.json({ success: true, message: 'Reservation updated' });
  } catch (err) {
    console.error('Error in /:reservation_id:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /reservations/:reservation_id - Cancel and delete a reservation
router.delete('/:reservation_id', async (req, res) => {
  const { reservation_id } = req.params;
  try {
    const result = await db.query('DELETE FROM reservations WHERE id = $1', [reservation_id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (err) {
    console.error('Error in /:reservation_id:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;