import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import roomWithBalcony1 from '../assets/room_with_balcony1.png';
import roomWithBalcony2 from '../assets/room_with_balcony2.png';
import roomWithoutBalcony1 from '../assets/room_without_balcony1.png'
import roomWithoutBalcony2 from '../assets/room_without_balcony2.png';
import boys1 from '../assets/boys_room1.png';
import boys2 from '../assets/boys_room2.png';
import {
  FaUserGraduate,
  FaUtensils,
  FaClipboardCheck,
  FaTshirt,
  FaShieldAlt,
  FaBroom,
  FaWifi,
  FaDumbbell,
  FaBook,
  FaBed,
  FaTv,
  FaWater,
  FaBath,
  FaImage,
  FaUser,
  FaClock,
  FaMoneyBill
} from 'react-icons/fa';

const RoomAllocation = () => {
  const [view, setView] = useState('hostels'); // 'hostels', 'girls', 'boys', 'girls-new', 'girls-old'
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [reservation, setReservation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Load reservation from localStorage on page load
  useEffect(() => {
    const storedReservation = localStorage.getItem('reservation');
    const storedUserName = localStorage.getItem('userName');
    const storedUserEmail = localStorage.getItem('userEmail');
    const storedUserPhone = localStorage.getItem('userPhone');

    if (storedReservation && storedUserName && storedUserEmail && storedUserPhone) {
      const parsedReservation = JSON.parse(storedReservation);
      const now = new Date();
      const expiresAt = new Date(parsedReservation.expires_at);

      if (expiresAt > now) {
        // Reservation is still valid
        setReservation(parsedReservation);
        setUserName(storedUserName);
        setUserEmail(storedUserEmail);
        setUserPhone(storedUserPhone);
      } else {
        // Reservation has expired, clear localStorage
        localStorage.removeItem('reservation');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
      }
    }
  }, []);

  // Fetch rooms when view or floor changes
  useEffect(() => {
    if (view === 'girls-new' || view === 'girls-old') {
      fetchRooms('Girls', view === 'girls-new' ? 'New' : 'Old', selectedFloor);
    } else if (view === 'boys') {
      fetchRooms('Boys', null, selectedFloor);
    }
  }, [view, selectedFloor]);

  // Timer for reservation expiry
  useEffect(() => {
    if (reservation) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiresAt = new Date(reservation.expires_at);
        const diff = expiresAt - now;
        if (diff <= 0) {
          setReservation(null);
          setTimeLeft(null);
          setUserName('');
          setUserEmail('');
          setUserPhone('');
          localStorage.removeItem('reservation');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userPhone');
          clearInterval(interval);
          fetchRooms(
            view === 'boys' ? 'Boys' : 'Girls',
            view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
            selectedFloor
          );
        } else {
          const minutes = Math.floor(diff / 1000 / 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [reservation, view, selectedFloor]);

  const fetchRooms = async (hostelType, buildingType, floor) => {
    try {
      console.log('Fetching rooms with params:', { hostel_type: hostelType, building_type: buildingType, floor });
      const res = await axios.get('http://localhost:5000/api/rooms', {
        params: { hostel_type: hostelType, building_type: buildingType, floor }
      });
      console.log('Fetched rooms:', res.data);

      if (!res.data || res.data.length === 0) {
        console.log('No rooms found for the given parameters');
        setRooms([]);
        return;
      }

      // Fetch reservation status for each room
      const roomsWithReservationStatus = await Promise.all(
        res.data.map(async (room) => {
          console.log(`Checking reservation status for room ID: ${room.id}`);
          try {
            const reservationRes = await axios.get(`http://localhost:5000/api/rooms/check-reservation/${room.id}`);
            console.log(`Reservation status for room ID ${room.id}:`, reservationRes.data);
            return { ...room, hasPendingReservation: reservationRes.data.isReserved };
          } catch (err) {
            console.error(`Error fetching reservation status for room ID ${room.id}:`, err);
            return { ...room, hasPendingReservation: false }; // Default to false if the request fails
          }
        })
      );
      console.log('Rooms with reservation status:', roomsWithReservationStatus);
      setRooms(roomsWithReservationStatus);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      alert('Failed to fetch rooms. Please try again later.');
      setRooms([]);
    }
  };

  const handleReserve = async (roomId) => {
    const name = prompt('Please enter your name to reserve the seat:');
    if (!name) {
      alert('Name is required to reserve a seat.');
      return;
    }
    const email = prompt('Please enter your email:');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('A valid email is required to reserve a seat.');
      return;
    }
    const phone = prompt('Please enter your phone number:');
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      alert('A valid phone number is required to reserve a seat (e.g., +1234567890).');
      return;
    }

    try {
      const payload = {
        room_id: roomId,
        user_name: name,
        user_email: email,
        user_phone: phone
      };
      console.log('Sending reservation request:', payload);
      const res = await axios.post('http://localhost:5000/api/rooms/reserve', payload);
      console.log('Reservation response:', res.data);

      // Store reservation data in localStorage
      localStorage.setItem('reservation', JSON.stringify(res.data));
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPhone', phone);

      setReservation(res.data);
      setUserName(name);
      setUserEmail(email);
      setUserPhone(phone);

      // Refresh the rooms list to update reservation status
      fetchRooms(
        view === 'boys' ? 'Boys' : 'Girls',
        view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
        selectedFloor
      );
    } catch (err) {
      console.error('Error reserving seat:', err);
      alert(err.response?.data?.error || 'Failed to reserve seat');
    }
  };

  const handlePayment = async () => {
    try {
      const payload = {
        reservation_id: reservation.reservation_id,
        user_name: userName
      };
      console.log('Sending payment confirmation request:', payload);
      const res = await axios.post('http://localhost:5000/api/rooms/confirm-payment', payload);
      console.log('Payment response:', res.data);
      alert('Payment successful! Admin will create your credentials soon.');

      // Clear localStorage after successful payment
      localStorage.removeItem('reservation');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPhone');

      setReservation(null);
      setTimeLeft(null);
      setUserName('');
      setUserEmail('');
      setUserPhone('');

      fetchRooms(
        view === 'boys' ? 'Boys' : 'Girls',
        view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
        selectedFloor
      );
    } catch (err) {
      console.error('Error confirming payment:', err);
      alert(err.response?.data?.error || 'Payment failed');
    }
  };

  const hasVacancy = (room) => {
    const isVacant = !room.member1_id || !room.member2_id;
    console.log(`Room ${room.room_number} has vacancy:`, isVacant, 'Member1:', room.member1_id, 'Member2:', room.member2_id);
    return isVacant;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        {view === 'hostels' && (
          <div className="max-w-7xl mx-auto ">
            {/* Facilities Section */}
            <h2 className='section-title'>Hostel Facilities</h2>
            <section className="py-16 bg-blue-50 section-border">
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                <div className="facility-card">
                  <FaUserGraduate className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Comfortable Rooms</h3>
                  <p className="text-gray-600">Spacious rooms with Wi-Fi and study desks.</p>
                </div>
                <div className="facility-card">
                  <FaUtensils className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Canteen Services</h3>
                  <p className="text-gray-600">Healthy, hygienic food available daily.</p>
                </div>
                <div className="facility-card">
                  <FaClipboardCheck className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Attendance Tracking</h3>
                  <p className="text-gray-600">Real-time attendance tracking for students.</p>
                </div>
                <div className="facility-card">
                  <FaTshirt className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Laundry Services</h3>
                  <p className="text-gray-600">Convenient laundry services for students.</p>
                </div>
                <div className="facility-card">
                  <FaShieldAlt className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">24/7 Security</h3>
                  <p className="text-gray-600">CCTV surveillance and security guards.</p>
                </div>
                <div className="facility-card">
                  <FaBroom className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Room Cleaning</h3>
                  <p className="text-gray-600">Regular cleaning services for hygiene.</p>
                </div>
                <div className="facility-card">
                  <FaWifi className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">High-Speed Wi-Fi</h3>
                  <p className="text-gray-600">Uninterrupted internet access for all students.</p>
                </div>
                <div className="facility-card">
                  <FaDumbbell className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Gym Facilities</h3>
                  <p className="text-gray-600">Stay fit with our on-site gym.</p>
                </div>
                <div className="facility-card">
                  <FaBook className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Library Access</h3>
                  <p className="text-gray-600">Quiet study spaces and a wide range of books.</p>
                </div>
                <div className="facility-card">
                  <FaBed className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Cozy Beds</h3>
                  <p className="text-gray-600">Comfortable beds for a good night's sleep.</p>
                </div>
                <div className="facility-card">
                  <FaTv className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Common Room</h3>
                  <p className="text-gray-600">Relax and socialize with a TV and games.</p>
                </div>
                <div className="facility-card">
                  <FaWater className="text-blue-900 text-4xl mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Water Purifier</h3>
                  <p className="text-gray-600">Access to clean and safe drinking water.</p>
                </div>
              </div>
            </section>
            <h2 className="section-title ">Room Allocation</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setView('girls')}
              >
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Girls' Hostel</h3>
                <p className="text-gray-600 mt-2">Explore rooms in the Girls' Hostel</p>
              </div>
              <div
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setView('boys')}
              >
                <h3 className="text-2xl font-bold text-blue-900">Boys' Hostel</h3>
                <p className="text-gray-600 mt-2">Explore rooms in the Boys' Hostel</p>
              </div>
            </div>
          </div>
        )}

        {view === 'girls' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="section-title">Girls' Hostel</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setView('girls-new')}
              >
                <h3 className="text-2xl font-bold text-blue-900">New Building</h3>
                <p className="text-gray-600 mt-2">Modern rooms with attached washroom, bathroom, and balcony</p>
              </div>
              <div
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setView('girls-old')}
              >
                <h3 className="text-2xl font-bold text-blue-900">Old Building</h3>
                <p className="text-gray-600 mt-2">Comfortable rooms with attached washroom and bathroom</p>
              </div>
            </div>
          </div>
        )}

        {(view === 'girls-new' || view === 'girls-old') && (
          <div className="max-w-7xl mx-auto">
            <h2 className="section-title">
              Girls' Hostel - {view === 'girls-new' ? 'New Building' : 'Old Building'}
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Instructions</h3>
              <p className="text-gray-600 font-semibold">
                {view === 'girls-new'
                  ? 'Every room in the New Building has an attached washroom, bathroom, and balcony. Each room accommodates 2 members.'
                  : 'Every room in the Old Building has an attached washroom and bathroom but no balcony. Each room accommodates 2 members.'}
              </p>
              <p className="text-gray-600 mt-2 font-semibold">
                Rent: ₹{view === 'girls-new' ? '8000' : '7000'} per person per month. Annual rent: ₹{view === 'girls-new' ? '96000' : '84000'} per person.
              </p>
            </div>

            {(view === 'girls-new') && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Room Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <img src={roomWithBalcony1} alt="Room 1" className="rounded-lg" />
                  <img src={roomWithBalcony2} alt="Room 2" className="rounded-lg" />
                </div>
              </div>
            )}
            {(view === 'girls-old') && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Room Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <img src={roomWithoutBalcony1} alt="Room 1" className="rounded-lg" />
                  <img src={roomWithoutBalcony2} alt="Room 2" className="rounded-lg" />
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Building Layout</h3>
              <p className="text-gray-600 mb-4 font-semibold">
                The building has 6 floors, with 8 rooms per floor. All rooms have a capacity of 2 members.
              </p>
              <div className="flex space-x-4 mb-4 font-medium">
                {[1, 2, 3, 4, 5, 6].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-4 py-2 rounded-lg ${selectedFloor === floor ? 'bg-blue-900 text-white' : 'bg-gray-200 text-blue-900'}`}
                  >
                    Floor {floor}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-medium">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 shadow-md ${hasVacancy(room) ? 'bg-green-100' : 'bg-red-100'}`}
                  >
                    <h4 className="text-lg font-semibold text-blue-900">Room {room.room_number}</h4>
                    <p className="text-gray-600">Capacity: 2 Members</p>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span>Member 1:</span>
                        {room.member1_id ? (
                          <span className="text-blue-900">{room.member1_name}</span>
                        ) : (
                          <span className="text-gray-500">Vacant</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Member 2:</span>
                        {room.member2_id ? (
                          <span className="text-blue-900">{room.member2_name}</span>
                        ) : (
                          <span className="text-gray-500">Vacant</span>
                        )}
                      </div>
                    </div>
                    {hasVacancy(room) && !reservation && (
                      <button
                        onClick={() => handleReserve(room.id)}
                        className="mt-4 bg-blue-900 text-white px-4 py-2 rounded-lg"
                      >
                        Reserve Seat
                      </button>
                    )}
                    {room.hasPendingReservation && !reservation && hasVacancy(room) && (
                      <p className="mt-4 text-red-500">One seat is currently reserved by another user</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {reservation && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Complete Payment</h3>
                <p className="text-gray-600 mb-4 font-semibold">
                  You have reserved a seat, {userName}. Complete the payment within the time limit to confirm your booking.
                </p>
                <p className="text-gray-600 mb-4 flex items-center">
                  <FaClock className="mr-2" /> Time Left: {timeLeft || 'Calculating...'}
                </p>
                <button
                  onClick={handlePayment}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <FaMoneyBill className="mr-2" /> Pay Now
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'boys' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="section-title">Boys' Hostel</h2>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Instructions</h3>
              <p className="text-gray-600 font-semibold">
                Every room in the Boys' Hostel has an attached washroom and bathroom but no balcony. Each room accommodates 2 members.
              </p>
              <p className="text-gray-600 mt-2 font-semibold">
                Rent: ₹7000 per person per month. Annual rent: ₹84000 per person.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Room Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <img src={boys1} alt="Room 1" className="rounded-lg" />
                <img src={boys2} alt="Room 2" className="rounded-lg" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Building Layout</h3>
              <p className="text-gray-600 mb-4 font-semibold">
                The building has 6 floors, with 8 rooms per floor. All rooms have a capacity of 2 members.
              </p>
              <div className="flex space-x-4 mb-4">
                {[1, 2, 3, 4, 5, 6].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-4 py-2 rounded-lg ${selectedFloor === floor ? 'bg-blue-900 text-white' : 'bg-gray-200 text-blue-900'}`}
                  >
                    Floor {floor}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 shadow-md ${hasVacancy(room) ? 'bg-green-100' : 'bg-red-100'}`}
                  >
                    <h4 className="text-lg font-semibold text-blue-900">Room {room.room_number}</h4>
                    <p className="text-gray-600">Capacity: 2 Members</p>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span>Member 1:</span>
                        {room.member1_id ? (
                          <span className="text-blue-900">{room.member1_name}</span>
                        ) : (
                          <span className="text-gray-500">Vacant</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Member 2:</span>
                        {room.member2_id ? (
                          <span className="text-blue-900">{room.member2_name}</span>
                        ) : (
                          <span className="text-gray-500">Vacant</span>
                        )}
                      </div>
                    </div>
                    {hasVacancy(room) && !reservation && (
                      <button
                        onClick={() => handleReserve(room.id)}
                        className="mt-4 bg-blue-900 text-white px-4 py-2 rounded-lg"
                      >
                        Reserve Seat
                      </button>
                    )}
                    {room.hasPendingReservation && !reservation && hasVacancy(room) && (
                      <p className="mt-4 text-red-500">One seat is currently reserved by another user</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {reservation && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Complete Payment</h3>
                <p className="text-gray-600 mb-4 font-semibold">
                  You have reserved a seat, {userName}. Complete the payment within the time limit to confirm your booking.
                </p>
                <p className="text-gray-600 mb-4 flex items-center">
                  <FaClock className="mr-2" /> Time Left: {timeLeft || 'Calculating...'}
                </p>
                <button
                  onClick={handlePayment}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <FaMoneyBill className="mr-2" /> Pay Now
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RoomAllocation;