CREATE DATABASE hostel_management;
USE hostel_management;

-- Students table (with password for authentication)
CREATE TABLE students (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    room_number VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (email)
);

-- Admins table (for admin authentication)
CREATE TABLE admins (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phoneNo VARCHAR(15),
    PRIMARY KEY (id),
    UNIQUE (username),
    UNIQUE (email)
);

-- Complaints table
CREATE TABLE complaints (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id)
);

-- Leaves table
CREATE TABLE leaves (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id)
);

-- Canteen Menu table
CREATE TABLE centeen_menu (
    id INT NOT NULL AUTO_INCREMENT,
    day VARCHAR(20) NOT NULL,
    menu TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Room Cleaning table
-- CREATE TABLE room_cleaning (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   room_number VARCHAR(10) NOT NULL,
--   scheduled_date DATE NOT NULL,
--   status VARCHAR(20) DEFAULT 'pending',
--   cleaned_by VARCHAR(100),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Attendance table
CREATE TABLE attendance (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT,
    date DATE,
    status VARCHAR(20),
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id)
);

-- Hostel Bookings table
CREATE TABLE hostel_bookings (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT,
    room_number VARCHAR(10) NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id)
);

-- Laundry Notifications table
CREATE TABLE laundry_notifications (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT,
    request_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id)
);

CREATE TABLE notifications (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_name VARCHAR(100),
    notification_type VARCHAR(50),
    admin_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_admin_id (admin_id)
);

CREATE TABLE rooms (
    id INT NOT NULL AUTO_INCREMENT,
    hostel_type VARCHAR(10) NOT NULL,
    building_type VARCHAR(10),
    floor INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    has_washroom TINYINT(1) DEFAULT 1,
    has_bathroom TINYINT(1) DEFAULT 1,
    has_balcony TINYINT(1) DEFAULT 0,
    rent_per_person INT NOT NULL,
    total_rent INT NOT NULL,
    member1_id INT,
    member2_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (member1_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (member2_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_member1_id (member1_id),
    INDEX idx_member2_id (member2_id)
);

CREATE TABLE reservations (
    id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    user_phone VARCHAR(15) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_room_id (room_id)
);

-- Hostel Doctors Table
CREATE TABLE hostel_doctors (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15),
    specialization VARCHAR(100),
    availability VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (email)
);

-- Hostel Rules Table
CREATE TABLE hostel_rules (
    id INT NOT NULL AUTO_INCREMENT,
    rule_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Hostel Images Table
CREATE TABLE hostel_images (
    id INT NOT NULL AUTO_INCREMENT,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);