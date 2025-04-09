import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import roomWithBalcony1 from '../assets/room_with_balcony1.png';
import roomWithBalcony2 from '../assets/room_with_balcony2.png';
import roomWithoutBalcony1 from '../assets/room_without_balcony1.png';
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
  FaClock,
  FaMoneyBill,
  FaSpinner,
} from 'react-icons/fa';

const RoomAllocation = () => {
  const [view, setView] = useState('hostels');
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [reservation, setReservation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setReservation(parsedReservation);
        setUserName(storedUserName);
        setUserEmail(storedUserEmail);
        setUserPhone(storedUserPhone);
        startTimer(expiresAt);
      } else {
        clearReservation();
      }
    }
  }, []);

  useEffect(() => {
    if (view === 'girls-new' || view === 'girls-old' || view === 'boys') {
      fetchRooms(
        view === 'boys' ? 'Boys' : 'Girls',
        view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
        selectedFloor
      );
    }
  }, [view, selectedFloor]);

  const startTimer = (expiresAt) => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiresAt - now;
      if (diff <= 0) {
        clearReservation();
        clearInterval(interval);
        setError('Reservation expired. Please reserve again.');
      } else {
        const minutes = Math.floor(diff / 1000 / 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  };

  const fetchRooms = async (hostelType, buildingType, floor) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/rooms', {
        params: { hostel_type: hostelType, building_type: buildingType, floor },
      });

      if (!res.data || res.data.length === 0) {
        setRooms([]);
        return;
      }

      const roomsWithReservationStatus = await Promise.all(
        res.data.map(async (room) => {
          try {
            const reservationRes = await axios.get(`http://localhost:5000/api/rooms/check-reservation/${room.id}`);
            return { ...room, hasPendingReservation: reservationRes.data.isReserved };
          } catch (err) {
            console.error(`Error fetching reservation status for room ID ${room.id}:`, err);
            return { ...room, hasPendingReservation: false };
          }
        })
      );
      setRooms(roomsWithReservationStatus);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try refreshing the page.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (roomId) => {
    const name = prompt('Please enter your name:');
    if (!name) {
      alert('Name is required.');
      return;
    }
    const email = prompt('Please enter your email:');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('A valid email is required.');
      return;
    }
    const phone = prompt('Please enter your phone number:');
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      alert('A valid phone number is required (e.g., +1234567890).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        room_id: roomId,
        user_name: name,
        user_email: email,
        user_phone: phone,
      };
      const res = await axios.post('http://localhost:5000/api/rooms/reserve', payload);

      localStorage.setItem('reservation', JSON.stringify(res.data));
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPhone', phone);

      setReservation(res.data);
      setUserName(name);
      setUserEmail(email);
      setUserPhone(phone);
      startTimer(new Date(res.data.expires_at));

      fetchRooms(
        view === 'boys' ? 'Boys' : 'Girls',
        view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
        selectedFloor
      );
    } catch (err) {
      console.error('Error reserving seat:', err);
      setError(err.response?.data?.error || 'Failed to reserve seat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!reservation || !timeLeft) {
      setError('No active reservation or time has expired.');
      return;
    }

    if (!window.Razorpay) {
      setError('Payment service is unavailable. Please try again later.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const amount = reservation.amount || (view === 'girls-new' ? 8000 : 7000);
      const orderRes = await axios.post('http://localhost:5000/api/payments/order', {
        amount: amount,
        currency: 'INR',
      });
      const { id: order_id } = orderRes.data;

      const options = {
        key: 'rzp_test_9Q6Lg9fdFP0HHi',
        amount: amount * 100,
        currency: 'INR',
        name: 'Hostel Management',
        description: `Hostel Fee for Room ${reservation.room_number} (Floor ${selectedFloor}, ${view === 'boys' ? 'Boys' : view === 'girls-new' ? 'New Girls' : 'Old Girls'})`,
        order_id: order_id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post('http://localhost:5000/api/payments/verify', {
              razorpay_order_id: order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              const confirmRes = await axios.post('http://localhost:5000/api/rooms/confirm-payment', {
                reservation_id: reservation.reservation_id,
                user_name: userName,
                payment_id: response.razorpay_payment_id,
              });

              alert(confirmRes.data.message);
              clearReservation();
              fetchRooms(
                view === 'boys' ? 'Boys' : 'Girls',
                view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
                selectedFloor
              );
            } else {
              setError('Payment verification failed. Contact support.');
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setError('Payment verification failed. Please contact support with your payment details.');
          } finally {
            setLoading(false); // Ensure loading stops after payment attempt
          }
        },
        prefill: { name: userName, email: userEmail, contact: userPhone },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment window closed. You can still complete payment before the timer expires.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!reservation) return;

    const confirmCancel = window.confirm('Are you sure you want to cancel your reservation? This will free up your seat.');
    if (!confirmCancel) return;

    try {
      setLoading(true);
      setError(null);
      await axios.post('http://localhost:5000/api/rooms/cancel-reservation', {
        reservation_id: reservation.reservation_id,
        user_name: userName,
      });
      clearReservation();
      alert('Reservation cancelled successfully. You can now reserve another seat.');
      fetchRooms(
        view === 'boys' ? 'Boys' : 'Girls',
        view === 'girls-new' ? 'New' : view === 'girls-old' ? 'Old' : null,
        selectedFloor
      );
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError(err.response?.data?.error || 'Failed to cancel reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearReservation = () => {
    localStorage.removeItem('reservation');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    setReservation(null);
    setTimeLeft(null);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setError(null);
  };

  const hasVacancy = (room) => {
    return !room.member1_id || !room.member2_id;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        {error && (
          <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 text-red-900 underline">Dismiss</button>
          </div>
        )}

        {view === 'hostels' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="section-title">Hostel Facilities</h2>
            <section className="py-16 bg-blue-50 section-border">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                <div className="facility-card"><FaUserGraduate className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Comfortable Rooms</h3><p className="text-gray-600">Spacious rooms with Wi-Fi and study desks.</p></div>
                <div className="facility-card"><FaUtensils className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Canteen Services</h3><p className="text-gray-600">Healthy, hygienic food available daily.</p></div>
                <div className="facility-card"><FaClipboardCheck className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Attendance Tracking</h3><p className="text-gray-600">Real-time attendance tracking for students.</p></div>
                <div className="facility-card"><FaTshirt className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Laundry Services</h3><p className="text-gray-600">Convenient laundry services for students.</p></div>
                <div className="facility-card"><FaShieldAlt className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">24/7 Security</h3><p className="text-gray-600">CCTV surveillance and security guards.</p></div>
                <div className="facility-card"><FaBroom className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Room Cleaning</h3><p className="text-gray-600">Regular cleaning services for hygiene.</p></div>
                <div className="facility-card"><FaWifi className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">High-Speed Wi-Fi</h3><p className="text-gray-600">Uninterrupted internet access for all students.</p></div>
                <div className="facility-card"><FaDumbbell className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Gym Facilities</h3><p className="text-gray-600">Stay fit with our on-site gym.</p></div>
                <div className="facility-card"><FaBook className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Library Access</h3><p className="text-gray-600">Quiet study spaces and a wide range of books.</p></div>
                <div className="facility-card"><FaBed className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Cozy Beds</h3><p className="text-gray-600">Comfortable beds for a good night's sleep.</p></div>
                <div className="facility-card"><FaTv className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Common Room</h3><p className="text-gray-600">Relax and socialize with a TV and games.</p></div>
                <div className="facility-card"><FaWater className="text-blue-900 text-4xl mb-4" /><h3 className="text-xl font-semibold text-blue-900 mb-2">Water Purifier</h3><p className="text-gray-600">Access to clean and safe drinking water.</p></div>
              </div>
            </section>
            <h2 className="section-title">Room Allocation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setView('girls')}>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Girls' Hostel</h3>
                <p className="text-gray-600 mt-2">Explore rooms in the Girls' Hostel</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setView('boys')}>
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
              <div className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setView('girls-new')}>
                <h3 className="text-2xl font-bold text-blue-900">New Building</h3>
                <p className="text-gray-600 mt-2">Modern rooms with attached washroom, bathroom, and balcony</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setView('girls-old')}>
                <h3 className="text-2xl font-bold text-blue-900">Old Building</h3>
                <p className="text-gray-600 mt-2">Comfortable rooms with attached washroom and bathroom</p>
              </div>
            </div>
          </div>
        )}

        {(view === 'girls-new' || view === 'girls-old' || view === 'boys') && (
          <div className="max-w-7xl mx-auto">
            <h2 className="section-title">
              {view === 'girls-new' ? "Girls' Hostel - New Building" : view === 'girls-old' ? "Girls' Hostel - Old Building" : "Boys' Hostel"}
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Instructions</h3>
              <p className="text-gray-600 font-semibold">
                {view === 'girls-new'
                  ? 'Every room in the New Building has an attached washroom, bathroom, and balcony. Each room accommodates 2 members.'
                  : view === 'girls-old'
                  ? 'Every room in the Old Building has an attached washroom and bathroom but no balcony. Each room accommodates 2 members.'
                  : 'Every room in the Boys\' Hostel has an attached washroom and bathroom but no balcony. Each room accommodates 2 members.'}
              </p>
              <p className="text-gray-600 mt-2 font-semibold">
                Rent: ₹{view === 'girls-new' ? '8000' : '7000'} per person per month. Annual rent: ₹{view === 'girls-new' ? '96000' : '84000'} per person.
              </p>
            </div>

            {(view === 'girls-new' || view === 'girls-old' || view === 'boys') && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Room Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {view === 'girls-new' && (
                    <>
                      <img src={roomWithBalcony1} alt="Room 1" className="rounded-lg" />
                      <img src={roomWithBalcony2} alt="Room 2" className="rounded-lg" />
                    </>
                  )}
                  {view === 'girls-old' && (
                    <>
                      <img src={roomWithoutBalcony1} alt="Room 1" className="rounded-lg" />
                      <img src={roomWithoutBalcony2} alt="Room 2" className="rounded-lg" />
                    </>
                  )}
                  {view === 'boys' && (
                    <>
                      <img src={boys1} alt="Room 1" className="rounded-lg" />
                      <img src={boys2} alt="Room 2" className="rounded-lg" />
                    </>
                  )}
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
                    disabled={loading}
                  >
                    Floor {floor}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-medium">
                {loading ? (
                  <div className="col-span-full flex justify-center items-center">
                    <FaSpinner className="animate-spin text-blue-900 text-4xl" />
                    <span className="ml-2 text-blue-900">Loading rooms...</span>
                  </div>
                ) : rooms.length > 0 ? (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`border rounded-lg p-4 shadow-md ${hasVacancy(room) ? 'bg-green-100' : 'bg-red-100'}`}
                    >
                      <h4 className="text-lg font-semibold text-blue-900">Room {room.room_number}</h4>
                      <p className="text-gray-600">Capacity: 2 Members</p>
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span>Member 1:</span>
                          {room.member1_id ? <span className="text-blue-900">{room.member1_name}</span> : <span className="text-gray-500">Vacant</span>}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Member 2:</span>
                          {room.member2_id ? <span className="text-blue-900">{room.member2_name}</span> : <span className="text-gray-500">Vacant</span>}
                        </div>
                      </div>
                      {hasVacancy(room) && !reservation && !room.hasPendingReservation && (
                        <button
                          onClick={() => handleReserve(room.id)}
                          className="mt-4 bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center"
                          disabled={loading}
                        >
                          {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Reserve Seat'}
                        </button>
                      )}
                      {room.hasPendingReservation && !reservation && hasVacancy(room) && (
                        <p className="mt-4 text-red-500">This room is currently reserved by another user.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-600">No rooms available for this selection.</p>
                )}
              </div>
            </div>

            {reservation && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Complete Payment</h3>
                <p className="text-gray-600 mb-4 font-semibold">
                  You have reserved a seat, {userName}. Complete the payment of ₹{reservation.amount || (view === 'girls-new' ? 8000 : 7000)} within the time limit to confirm your booking.
                </p>
                <p className="text-gray-600 mb-4 flex items-center">
                  <FaClock className="mr-2" /> Time Left: {timeLeft || 'Calculating...'}
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={handlePayment}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                    disabled={loading || !timeLeft}
                  >
                    {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaMoneyBill className="mr-2" />}
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                  <button
                    onClick={handleCancelReservation}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
                    disabled={loading}
                  >
                    {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Cancel Reservation'}
                  </button>
                </div>
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