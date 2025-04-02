-- Seed students (password: "student123")
INSERT INTO students (name, email, password, room_number) VALUES 
('John Doe', 'john@example.com', '$2b$10$examplehashedpassword123', 'A101'),
('Jane Smith', 'jane@example.com', '$2b$10$examplehashedpassword456', 'A102');

-- Seed admins (password: "admin123")
INSERT INTO admins (username, email, password) VALUES 
('admin1', 'admin1@example.com', '$2b$10$examplehashedpassword789');

-- Seed canteen menu
INSERT INTO canteen_menu (day, menu) VALUES 
('Monday', 'Rice, Dal, Chicken Curry'),
('Tuesday', 'Pasta, Salad, Garlic Bread');

-- Seed attendance
INSERT INTO attendance (student_id, date, status) VALUES 
(1, '2025-04-01', 'present'),
(2, '2025-04-01', 'absent');

-- Seed laundry notifications
INSERT INTO laundry_notifications (student_id, request_date, status) VALUES 
(1, '2025-04-02', 'pending');