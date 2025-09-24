const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /rooms - Get all rooms with filtering and cleanup expired reservations
router.get('/', async (req, res) => {
  const { hostel_type, building_type, floor } = req.query;
  try {
    await db.query('DELETE FROM reservations WHERE expires_at < $1 AND status = $2', [new Date(), 'pending']);
    
    let query = `
      SELECT r.*, s1.name AS member1_name, s2.name AS member2_name
      FROM rooms r
      LEFT JOIN students s1 ON r.member1_id = s1.id
      LEFT JOIN students s2 ON r.member2_id = s2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (hostel_type) {
      paramCount++;
      query += ` AND r.hostel_type = $${paramCount}`;
      params.push(hostel_type);
    }
    if (building_type) {
      paramCount++;
      query += ` AND r.building_type = $${paramCount}`;
      params.push(building_type);
    }
    if (floor) {
      paramCount++;
      query += ` AND r.floor = $${paramCount}`;
      params.push(parseInt(floor));
    }
    query += ' ORDER BY r.floor, r.room_number';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching rooms:', err.stack);
    res.status(500).json({ error: 'Failed to fetch rooms', details: err.message });
  }
});

// GET /rooms/check-reservation/:room_id - Check if a room has active reservations
router.get('/check-reservation/:room_id', async (req, res) => {
  const { room_id } = req.params;
  try {
    const existingResult = await db.query(
      'SELECT * FROM reservations WHERE room_id = $1 AND status = $2 AND expires_at > $3',
      [room_id, 'pending', new Date()]
    );
    res.json({ isReserved: existingResult.rows.length > 0 });
  } catch (err) {
    console.error('Error checking reservation:', err.stack);
    res.status(500).json({ error: 'Failed to check reservation', details: err.message });
  }
});

// POST /rooms/reserve - Create a new room reservation
router.post('/reserve', async (req, res) => {
  const { room_id, user_name, user_email, user_phone } = req.body;
  console.log('Reserve request:', { room_id, user_name, user_email, user_phone });
  
  if (!room_id || !user_name || !user_email || !user_phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    const roomResult = await db.query('SELECT * FROM rooms WHERE id = $1', [room_id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const room = roomResult.rows[0];
    const occupiedSeats = (room.member1_id ? 1 : 0) + (room.member2_id ? 1 : 0);
    if (occupiedSeats >= room.capacity) {
      return res.status(400).json({ error: 'Room is fully occupied' });
    }
    
    const existingResult = await db.query(
      'SELECT * FROM reservations WHERE room_id = $1 AND status = $2 AND expires_at > $3',
      [room_id, 'pending', new Date()]
    );
    if (occupiedSeats + existingResult.rows.length >= room.capacity) {
      return res.status(400).json({ error: 'All seats are reserved or occupied' });
    }
    
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const amount = room.rent_per_person || (room.building_type === 'New' ? 8000 : 7000);
    
    const result = await db.query(
      `INSERT INTO reservations (room_id, student_name, student_email, user_phone, reserved_at, expires_at, status, amount, hostel_type, building_type, floor, room_number) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        room_id,
        user_name,
        user_email,
        user_phone,
        new Date(),
        expiresAt,
        'pending',
        amount,
        room.hostel_type,
        room.building_type,
        room.floor,
        room.room_number,
      ]
    );
    
    res.json({
      reservation_id: result.rows[0].id,
      user_name,
      user_email,
      user_phone,
      expires_at: expiresAt,
      amount,
      room_number: room.room_number,
    });
  } catch (err) {
    console.error('Error reserving room:', err.stack);
    res.status(500).json({ error: 'Failed to reserve room', details: err.message });
  }
});

// POST /rooms/confirm-payment - Confirm payment and assign room to student
router.post('/confirm-payment', async (req, res) => {
  const { reservation_id, user_name, user_email, user_phone, payment_id } = req.body;
  console.log('Confirm payment request:', { reservation_id, user_name, user_email, user_phone, payment_id });

  try {
    // Validate reservation
    const reservationResult = await db.query(
      'SELECT * FROM reservations WHERE id = $1 AND student_name = $2 AND status = $3',
      [reservation_id, user_name, 'pending']
    );

    if (reservationResult.rows.length === 0) {
      console.error('Invalid or expired reservation:', { reservation_id, user_name });
      return res.status(400).json({ error: 'Invalid or expired reservation' });
    }

    const reservation = reservationResult.rows[0];
    const now = new Date();
    if (new Date(reservation.expires_at) < now) {
      await db.query('DELETE FROM reservations WHERE id = $1', [reservation_id]);
      console.error('Reservation expired:', { reservation_id });
      return res.status(400).json({ error: 'Reservation has expired' });
    }

    // Validate room
    const roomResult = await db.query('SELECT * FROM rooms WHERE id = $1', [reservation.room_id]);
    if (roomResult.rows.length === 0) {
      await db.query('DELETE FROM reservations WHERE id = $1', [reservation_id]);
      console.error('Room not found:', { room_id: reservation.room_id });
      return res.status(400).json({ error: 'Room is no longer available' });
    }

    const room = roomResult.rows[0];
    if (room.member1_id && room.member2_id) {
      await db.query('DELETE FROM reservations WHERE id = $1', [reservation_id]);
      console.error('Room fully occupied:', { room_id: reservation.room_id });
      return res.status(400).json({ error: 'Room is no longer available' });
    }

    // Check or create student
    let studentId = null;
    const existingStudentResult = await db.query('SELECT id, password, room_number FROM students WHERE email = $1', [user_email]);

    if (existingStudentResult.rows.length > 0) {
      const existingStudent = existingStudentResult.rows[0];
      if (existingStudent.password) {
        console.error('Student credentials already exist:', { user_email });
        return res.status(400).json({ error: 'Student credentials already exist' });
      }
      if (existingStudent.room_number) {
        console.error('Student already assigned to room:', { user_email, room_number: existingStudent.room_number });
        return res.status(400).json({ error: `Student is already assigned to ${existingStudent.room_number}` });
      }
      studentId = existingStudent.id;
    } else {
      const roomName = `${room.hostel_type} ${room.building_type ? room.building_type + ' ' : ''}Room ${room.room_number}`;
      const studentResult = await db.query(
        'INSERT INTO students (name, email, room_number, password) VALUES ($1, $2, $3, NULL) RETURNING id',
        [user_name, user_email, roomName]
      );
      studentId = studentResult.rows[0].id;
      console.log('New student created:', { studentId, user_email });
    }

    // Assign student to room
    const memberField = !room.member1_id ? 'member1_id' : 'member2_id';
    await db.query(`UPDATE rooms SET ${memberField} = $1 WHERE id = $2`, [studentId, room.id]);
    console.log('Room updated:', { room_id: room.id, memberField, studentId });

    // Update student room_number
    const roomName = `${room.hostel_type} ${room.building_type ? room.building_type + ' ' : ''}Room ${room.room_number}`;
    await db.query('UPDATE students SET room_number = $1 WHERE id = $2', [roomName, studentId]);
    console.log('Student room updated:', { studentId, roomName });

    // Insert payment record (removed order_id)
    await db.query(
      'INSERT INTO payments (student_id, payment_id, amount, status, created_at) VALUES ($1, $2, $3, $4, $5)',
      [studentId, payment_id, reservation.amount, 'completed', new Date()]
    );
    console.log('Payment recorded:', { studentId, payment_id, amount: reservation.amount });

    // Delete reservation
    await db.query('DELETE FROM reservations WHERE id = $1', [reservation_id]);
    console.log('Reservation deleted:', { reservation_id });

    // Notify admins
    const adminsResult = await db.query('SELECT id FROM admins');
    const phoneNumber = user_phone || reservation.user_phone || 'N/A';
    for (const admin of adminsResult.rows) {
      await db.query(
        'INSERT INTO notifications (admin_id, message, admin_name, notification_type) VALUES ($1, $2, $3, $4)',
        [
          admin.id,
          `${user_name} completed their payment (${user_email}, ${phoneNumber}) for ${room.hostel_type} ${room.building_type ? room.building_type + ' ' : ''}Room ${room.room_number}.`,
          'System',
          'Payment Completion',
        ]
      );
    }
    console.log('Notifications sent to admins:', { adminCount: adminsResult.rows.length });

    res.json({ message: 'Payment successful! Admin will create your credentials soon.' });
  } catch (err) {
    console.error('Error confirming payment:', err.stack);
    res.status(500).json({ error: 'Failed to confirm payment', details: err.message });
  }
});

// POST /rooms/cancel-reservation - Cancel a pending reservation
router.post('/cancel-reservation', async (req, res) => {
  const { reservation_id, user_name } = req.body;
  try {
    const reservationResult = await db.query(
      'SELECT * FROM reservations WHERE id = $1 AND student_name = $2 AND status = $3',
      [reservation_id, user_name, 'pending']
    );
    
    if (reservationResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid reservation' });
    }
    
    await db.query('DELETE FROM reservations WHERE id = $1', [reservation_id]);
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling reservation:', err.stack);
    res.status(500).json({ error: 'Failed to cancel reservation', details: err.message });
  }
});

// PUT /rooms/update/:id - Update room member assignments
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { member1_id, member2_id } = req.body;

  try {
    const roomResult = await db.query('SELECT * FROM rooms WHERE id = $1', [parseInt(id, 10)]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];

    // Validate that students are not assigned to another room
    for (const [memberField, memberId] of [['member1_id', member1_id], ['member2_id', member2_id]]) {
      if (memberId !== null && memberId !== undefined) {
        const existingRoomResult = await db.query(
          'SELECT room_number FROM rooms WHERE (member1_id = $1 OR member2_id = $1) AND id != $2',
          [parseInt(memberId, 10), parseInt(id, 10)]
        );
        if (existingRoomResult.rows.length > 0) {
          return res.status(400).json({
            error: `Student is already assigned to ${existingRoomResult.rows[0].room_number}. Remove them first.`
          });
        }
      }
    }

    // Clear room number if member is being removed
    if (room.member1_id && (member1_id === null || member1_id === undefined)) {
      await db.query('UPDATE students SET room_number = NULL WHERE id = $1', [room.member1_id]);
    }
    if (room.member2_id && (member2_id === null || member2_id === undefined)) {
      await db.query('UPDATE students SET room_number = NULL WHERE id = $1', [room.member2_id]);
    }

    // Update room members
    const member1Val = member1_id !== undefined ? (member1_id !== null ? parseInt(member1_id, 10) : null) : room.member1_id;
    const member2Val = member2_id !== undefined ? (member2_id !== null ? parseInt(member2_id, 10) : null) : room.member2_id;

    await db.query(
      'UPDATE rooms SET member1_id = $1, member2_id = $2 WHERE id = $3',
      [member1Val, member2Val, parseInt(id, 10)]
    );

    res.json({ message: 'Room updated successfully' });
  } catch (err) {
    console.error(`Error updating room id ${id}:`, err.stack);
    res.status(500).json({ error: 'Failed to update room', details: err.message });
  }
});

module.exports = router;