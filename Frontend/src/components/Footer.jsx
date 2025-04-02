import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white p-6 text-center">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center space-x-6 mb-4">
          <Link to="/" className="text-white hover:text-yellow-400">Home</Link>
          <Link to="/about" className="text-white hover:text-yellow-400">About</Link>
          <Link to="/contact" className="text-white hover:text-yellow-400">Contact</Link>
          <Link to="/privacy" className="text-white hover:text-yellow-400">Privacy Policy</Link>
        </div>
        <p>© 2025 HostelElite. All rights reserved.</p>
        <p>Contact us: support@hostelelite.com | +1-234-567-890</p>
      </div>
    </footer>
  );
};

export default Footer;