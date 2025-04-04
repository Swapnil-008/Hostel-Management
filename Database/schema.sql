CREATE DATABASE hostel_management;
USE hostel_management;

-- Students table (with password for authentication)
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed password
  room_number VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table (for admin authentication)
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed password
  email VARCHAR(100) UNIQUE NOT NULL,
  phoneNo VARCHAR(15), -- Phone number (e.g., +1234567890, up to 15 characters to accommodate international formats)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Leaves table
CREATE TABLE leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Canteen Menu table
CREATE TABLE canteen_menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day VARCHAR(20) NOT NULL,
  menu TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room Cleaning table
CREATE TABLE room_cleaning (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL,
  scheduled_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  cleaned_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  date DATE,
  status VARCHAR(20),
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE KEY unique_date (student_id, date)
);

-- Hostel Bookings table
CREATE TABLE hostel_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  room_number VARCHAR(10) NOT NULL,
  booking_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Laundry Notifications table
CREATE TABLE laundry_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  request_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_type VARCHAR(10) NOT NULL, -- 'Girls' or 'Boys'
  building_type VARCHAR(10), -- 'New' or 'Old' (NULL for Boys' Hostel)
  floor INT NOT NULL, -- Floor number (1 to 6)
  room_number VARCHAR(10) NOT NULL, -- e.g., '101', '102'
  capacity INT NOT NULL DEFAULT 2, -- Fixed at 2 members per room
  has_washroom BOOLEAN DEFAULT TRUE, -- 1 for yes, 0 for no
  has_bathroom BOOLEAN DEFAULT TRUE, -- 1 for yes, 0 for no
  has_balcony BOOLEAN DEFAULT FALSE, -- 1 for yes, 0 for no
  rent_per_person INT NOT NULL, -- Rent per person
  total_rent INT NOT NULL, -- Total rent for the room
  member1_id INT DEFAULT NULL, -- Student ID for first member
  member2_id INT DEFAULT NULL, -- Student ID for second member
  FOREIGN KEY (member1_id) REFERENCES students(id) ON DELETE SET NULL,
  FOREIGN KEY (member2_id) REFERENCES students(id) ON DELETE SET NULL
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  student_id INT NOT NULL,
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL, -- Reservation expires after 30 minutes
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'expired'
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Hostel Doctors Table
CREATE TABLE hostel_doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone_no VARCHAR(15),
  specialization VARCHAR(100),
  availability VARCHAR(255), -- e.g., "Mon-Fri, 9 AM - 5 PM"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Rules Table
CREATE TABLE hostel_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rule_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Images Table
CREATE TABLE hostel_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(255) NOT NULL, -- URL or file path to the image
  caption VARCHAR(255), -- Optional caption for the image
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);