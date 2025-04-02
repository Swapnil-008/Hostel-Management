import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CanteenMenuView = () => {
  const [menu, setMenu] = useState([]);
  const [menuEditData, setMenuEditData] = useState({ id: '', day: '', menu: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/canteen-menu');
        setMenu(res.data);
      } catch (err) {
        alert('Failed to fetch menu');
      }
    };
    fetchMenu();
  }, []);

  const handleEditMenu = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/canteen-menu/${menuEditData.id}`, {
        day: menuEditData.day,
        menu: menuEditData.menu,
      });
      alert('Menu updated successfully');
      setMenuEditData({ id: '', day: '', menu: '' });
      const res = await axios.get('http://localhost:5000/api/canteen-menu');
      setMenu(res.data);
    } catch (err) {
      alert('Failed to update menu');
    }
  };

  const handleSelectMenuItem = (item) => {
    setMenuEditData({ id: item.id, day: item.day, menu: item.menu });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title">Canteen Menu</h2>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            {menu.length > 0 ? (
              menu.map((item) => (
                <div key={item.id} className="border-b py-4">
                  <p><strong className="text-blue-900">Day:</strong> {item.day}</p>
                  <p><strong className="text-blue-900">Menu:</strong> {item.menu}</p>
                  {user && user.username && (
                    <button
                      className="button mt-2"
                      onClick={() => handleSelectMenuItem(item)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center">No menu items found.</p>
            )}
          </div>
          {user && user.username && menuEditData.id && (
            <form onSubmit={handleEditMenu} className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Edit Menu Item</h3>
              <div className="mb-4">
                <label className="block text-blue-900 font-medium mb-2">Day</label>
                <input
                  type="text"
                  value={menuEditData.day}
                  onChange={(e) => setMenuEditData({ ...menuEditData, day: e.target.value })}
                  className="input-field"
                  placeholder="Enter day"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-blue-900 font-medium mb-2">Menu</label>
                <textarea
                  value={menuEditData.menu}
                  onChange={(e) => setMenuEditData({ ...menuEditData, menu: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Enter menu items"
                  required
                />
              </div>
              <button type="submit" className="button">
                Update Menu
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CanteenMenuView;