import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';

const Reservation = () => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [hostelType, setHostelType] = useState('Girls'); // Default value
  const [buildingType, setBuildingType] = useState('New'); // Default value
  const [floor, setFloor] = useState(1); // Default floor
  const [roomNumber, setRoomNumber] = useState('');
  const [rent, setRent] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [timer, setTimer] = useState(1800); // 30 minutes in seconds
  const [reservationId, setReservationId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/rooms', {
          params: { hostel_type: hostelType, building_type: buildingType, floor },
        });
        setRooms(res.data);
      } catch (err) {
        setError('Failed to load rooms: ' + err.response?.data?.error || err.message);
        console.error(err);
      }
    };
    fetchRooms();
  }, [hostelType, buildingType, floor]);

  useEffect(() => {
    let interval;
    if (reservationId && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      handleReservationExpiry();
    }
    return () => clearInterval(interval);
  }, [reservationId, timer]);

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !hostelType || !buildingType || !floor || !roomNumber) {
      setError('All fields are required.');
      return;
    }

    try {
      const roomRes = await axios.get(`http://localhost:5000/api/rooms?hostel_type=${hostelType}&building_type=${buildingType}&floor=${floor}&room_number=${roomNumber}`);
      const room = roomRes.data[0];
      if (!room) {
        setError('Room not found.');
        return;
      }
      setRent(room.rent_per_person || 0);

      const res = await axios.post('http://localhost:5000/api/reservations', {
        student_name: studentName,
        student_email: studentEmail,
        hostel_type: hostelType,
        building_type: buildingType,
        floor: floor,
        room_number: roomNumber,
        amount: room.rent_per_person,
        expiry_time: new Date(Date.now() + 30 * 60000).toISOString().slice(0, 19).replace('T', ' '),
      });
      setReservationId(res.data.id);
      setError('');
    } catch (err) {
      setError('Reservation failed: ' + err.response?.data?.error || err.message);
      console.error(err);
    }
  };

  const handleReservationExpiry = async () => {
    if (reservationId) {
      try {
        await axios.delete(`http://localhost:5000/api/reservations/${reservationId}`);
        setReservationId(null);
        setTimer(1800);
        setError('Reservation expired. Please reserve again.');
      } catch (err) {
        setError('Error expiring reservation: ' + err.message);
      }
    }
  };

  const handlePayment = async () => {
    if (!reservationId || timer <= 0) {
      setError('Reservation has expired or not created.');
      return;
    }

    try {
      const orderRes = await axios.post('http://localhost:5000/api/payments/order', {
        amount: rent,
        currency: 'INR',
      });
      const { id: order_id } = orderRes.data;

      const options = {
        key: 'rzp_test_9Q6Lg9fdFP0HHi', // Move to .env in production
        amount: rent * 100,
        currency: 'INR',
        name: 'Hostel Management',
        description: `Hostel Fee for Room ${roomNumber} (Floor ${floor}, ${buildingType} ${hostelType})`,
        order_id: order_id,
        handler: async (response) => {
          const verifyRes = await axios.post('http://localhost:5000/api/payments/verify', {
            razorpay_order_id: order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verifyRes.data.success) {
            await axios.put(`http://localhost:5000/api/reservations/${reservationId}`, {
              payment_id: response.razorpay_payment_id,
              status: 'completed',
            });
            await axios.post('http://localhost:5000/api/notifications/send', {
              message: `Student ${studentName} (${studentEmail}) has completed payment for Room ${roomNumber} (Floor ${floor}, ${buildingType} ${hostelType}).`,
              notification_type: 'payment',
              student_email: studentEmail,
            });
            alert('Payment successful! Admin will create your account.');
            setReservationId(null);
            setTimer(1800);
          }
        },
        prefill: {
          name: studentName,
          email: studentEmail,
          contact: '9999999999',
        },
        notes: {
          address: `Hostel Room ${roomNumber}, Floor ${floor}, ${buildingType} ${hostelType}`,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError('Payment failed: ' + err.message);
      console.error(err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title">Bed Reservation</h2>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleReserve} className="space-y-4">
              <div>
                <label className="block text-blue-900 mb-2">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-900 mb-2">Email</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-900 mb-2">Hostel Type</label>
                <select
                  value={hostelType}
                  onChange={(e) => setHostelType(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="Girls">Girls</option>
                  <option value="Boys">Boys</option>
                </select>
              </div>
              <div>
                <label className="block text-blue-900 mb-2">Building Type</label>
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="New">New</option>
                  <option value="Old">Old</option>
                </select>
              </div>
              <div>
                <label className="block text-blue-900 mb-2">Floor</label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(parseInt(e.target.value, 10))}
                  className="border p-2 rounded w-full"
                  required
                >
                  {[1, 2, 3, 4, 5, 6].map((fl) => (
                    <option key={fl} value={fl}>Floor {fl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-blue-900 mb-2">Room Number</label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.room_number} value={room.room_number}>
                      {room.room_number} (₹{room.rent_per_person})
                    </option>
                  ))}
                </select>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
              >
                Reserve Seat
              </button>
            </form>
            {reservationId && (
              <div className="mt-6">
                <p className="text-blue-900">Reservation active. Time remaining: {formatTime(timer)}</p>
                <button
                  onClick={handlePayment}
                  className="mt-4 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
                  disabled={timer <= 0}
                >
                  Pay Now
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reservation;