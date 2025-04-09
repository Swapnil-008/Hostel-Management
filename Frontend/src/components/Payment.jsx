import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';

const Payment = () => {
  const [amount, setAmount] = useState(0);
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    try {
      const orderRes = await axios.post('http://localhost:5000/api/payments/order', {
        amount,
        currency: 'INR',
      });
      const { id: order_id } = orderRes.data;
      setOrderId(order_id);

      const options = {
        key: 'rzp_test_9Q6Lg9fdFP0HHi',
        amount: amount * 100,
        currency: 'INR',
        name: 'Hostel Management',
        description: 'Hostel Fee Payment',
        order_id: order_id,
        handler: async (response) => {
          const verifyRes = await axios.post('http://localhost:5000/api/payments/verify', {
            razorpay_order_id: order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verifyRes.data.success) {
            setPaymentId(response.razorpay_payment_id);
            alert('Payment successful!');
          }
        },
        prefill: {
          name: 'Student Name',
          email: 'student@example.com',
          contact: '9999999999',
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title">Payment</h2>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-blue-900 mb-2">Amount (INR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="border p-2 rounded w-full"
                  min="1"
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              {paymentId && <p className="text-green-500">Payment ID: {paymentId}</p>}
              <button
                onClick={handlePayment}
                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
                disabled={!amount || amount <= 0}
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;