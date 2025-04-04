# Hostel-Management

## Overview

**Hostel-Management** is a full-stack web application designed to streamline hostel operations for both students and administrators. The system provides features such as room allocation, community management, complaint and leave management, canteen menu updates, laundry requests, attendance tracking, and general notifications. The application is built with a React frontend, a Node.js backend, and a MySQL database, ensuring a robust and scalable solution for hostel management.

## Features

- **Student Features**:
  - Register and log in to access a personalized dashboard.
  - Apply for leaves and file complaints.
  - Request laundry services.
  - View canteen menu and mark attendance.
  - Allocate rooms based on preferences (e.g., capacity, attached washroom, gallery).
  - View community details (students, admins, hostel doctor, images, and rules).
  - Receive notifications from admins.

- **Admin Features**:
  - Log in to access an admin dashboard.
  - View and manage student complaints and leave requests.
  - Mark student attendance and update the canteen menu.
  - Allocate rooms to students.
  - Send general notifications to all students.
  - Update hostel doctor information.

- **Public Features**:
  - Access the home page, room allocation, and community sections without authentication.
  - View community details (students, admins, hostel doctor, images, and rules) without logging in.

## Project Structure

The project is divided into three main directories: `Backend`, `Frontend`, and `Database`.

### Directory Structure
```Hostel-Management/
├── Backend/
│   ├── config/
│   │   └── db.js              # Database connection configuration
│   ├── routes/
│   │   ├── admins.js          # Routes for admin-related operations
│   │   ├── attendance.js      # Routes for attendance management
│   │   ├── auth.js            # Routes for authentication (login/register)
│   │   ├── canteenMenu.js     # Routes for canteen menu management
│   │   ├── complaints.js      # Routes for complaint management
│   │   ├── hostelDoctors.js   # Routes for hostel doctor management
│   │   ├── hostelImages.js    # Routes for hostel images
│   │   ├── hostelRules.js     # Routes for hostel rules
│   │   ├── hostel_bookings.js # Routes for hostel bookings
│   │   ├── laundryNotifications.js # Routes for laundry notifications
│   │   ├── leaves.js          # Routes for leave management
│   │   ├── notifications.js   # Routes for notifications
│   │   ├── rooms.js           # Routes for room allocation
│   │   ├── room_cleaning.js   # Routes for room cleaning schedules
│   │   └── students.js        # Routes for student-related operations
│   ├── node_modules/          # Node.js dependencies
│   ├── .env                   # Environment variables (e.g., database credentials)
│   ├── package-lock.json      # Dependency lock file
│   ├── package.json           # Backend dependencies and scripts
│   └── server.js              # Main backend server file
├── Database/
│   ├── README.md              # Database setup instructions
│   ├── schema.sql             # SQL schema for creating database tables
│   └── seed.sql               # SQL seed data for initial testing
├── Frontend/
│   ├── src/
│   │   ├── assets/            # Static assets (e.g., images, fonts)
│   │   ├── components/
│   │   │   ├── AdminComplaintsView.jsx # Component for viewing complaints (admin)
│   │   │   ├── AdminLeavesView.jsx     # Component for viewing leaves (admin)
│   │   │   ├── AttendanceView.jsx      # Component for attendance management
│   │   │   ├── CanteenMenuView.jsx     # Component for canteen menu management
│   │   │   ├── ComplaintForm.jsx       # Component for submitting complaints
│   │   │   ├── Footer.jsx              # Footer component
│   │   │   ├── Header.jsx              # Header component with navigation
│   │   │   ├── LaundryForm.jsx         # Component for laundry requests
│   │   │   ├── LeaveForm.jsx           # Component for leave applications
│   │   │   └── RoomAllocation.jsx      # Component for room allocation
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx      # Admin dashboard page
│   │   │   ├── AdminRoomAllocation.jsx # Admin room allocation page
│   │   │   ├── Community.jsx           # Community page (students, admins, etc.)
│   │   │   ├── Complaints.jsx          # Complaints page
│   │   │   ├── Dashboard.jsx           # Student dashboard page
│   │   │   ├── Home.jsx                # Home page
│   │   │   ├── Landing.jsx             # Landing page
│   │   │   ├── Login.jsx               # Login page
│   │   │   ├── Profile.jsx             # Profile page
│   │   │   ├── Register.jsx            # Registration page
│   │   │   └── SendNotification.jsx    # Page for sending notifications (admin)
│   │   ├── App.css                 # App-specific styles
│   │   ├── App.jsx                 # Main App component with routes
│   │   ├── index.css               # Global styles
│   │   └── main.jsx                # Entry point for React
│   ├── public/                     # Public assets (e.g., favicon)
│   ├── node_modules/               # Frontend dependencies
│   ├── .gitignore                  # Git ignore file
│   ├── eslint.config.js            # ESLint configuration
│   ├── index.html                  # HTML entry point
│   ├── package-lock.json           # Dependency lock file
│   ├── package.json                # Frontend dependencies and scripts
│   ├── postcss.config.js           # PostCSS configuration
│   ├── README.md                   # Frontend-specific README
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── vite.config.js              # Vite configuration
├── .gitignore                      # Git ignore file for the project
└── README.md                       # Project README (this file)
```

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MySQL** (v8 or higher)
- **Git** (for cloning the repository)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Hostel-Management.git
cd Hostel-Management

2. Set Up the Database
Install MySQL if not already installed.
Create the Database:
Open MySQL and run the following command to create the database:

CREATE DATABASE hostel_management;
USE hostel_management;

3. Run the Schema:
Execute the schema.sql file to create the necessary tables:
mysql -u your-username -p hostel_management < Database/schema.sql

4. Seed the Database (optional):
Populate the database with sample data using the seed.sql file:
mysql -u your-username -p hostel_management < Database/seed.sql

3. Set Up the Backend
 1.Navigate to the Backend Directory:
 cd Backend

 2.Install Dependencies:
 npm install

 3.Configure Environment Variables:
 Create a .env file in the Backend directory with the following content:
   DB_HOST=localhost
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_NAME=hostel_management
   PORT=5000
  Replace your-username and your-password with your MySQL credentials.

  4.Start the Backend Server:
 npm start
 The backend server will run on http://localhost:5000.

4. Set Up the Frontend
 1.Navigate to the Frontend Directory:
 cd ../Frontend

 2.Install Dependencies:
 npm install

 3.Start the Frontend Development Server:
 npm run dev
 The frontend will run on http://localhost:5173 (or the port specified by Vite).

5. Access the Application
-Open your browser and navigate to http://localhost:5173.
-Use the following default credentials to log in:
  -Admin: Username: admin1, Password: password
  -Student: Email: student@example.com, Password: password

Database Schema
The database (hostel_management) consists of the following tables:

-students: Stores student information (id, name, email, password, room_number, created_at).
-admins: Stores admin information (id, username, password, email, phoneNo, created_at).
-complaints: Stores student complaints (id, student_id, description, status, created_at).
-leaves: Stores student leave requests (id, student_id, start_date, end_date, reason, status, created_at).
-canteen_menu: Stores canteen menu for each day (id, day, menu, created_at).
-room_cleaning: Stores room cleaning schedules (id, room_number, scheduled_date, status, cleaned_by, created_at).
-attendance: Stores student attendance records (id, student_id, date, status).
-hostel_bookings: Stores hostel booking records (id, student_id, room_number, booking_date, status, created_at).
-laundry_notifications: Stores laundry requests (id, student_id, request_date, status, created_at).
-notifications: Stores notifications for students (id, student_id, message, created_at).
-rooms: Stores room details (id, size, capacity, has_washroom, has_gallery, rent_per_person, total_rent, available).
-room_preferences: Stores student room preferences (id, student_id, preferred_capacity, same_state_preference, attached_washroom, gallery, allocated_room_id).
-hostel_doctors: Stores hostel doctor information (id, name, email, phone_no, specialization, availability, created_at).
-hostel_rules: Stores hostel rules (id, rule_text, created_at).
-hostel_images: Stores hostel images (id, image_url, caption, created_at).
For the full schema, refer to Database/schema.sql.

API Endpoints
The backend provides the following API routes (base URL: http://localhost:5000/api):

 -Authentication:
  -POST /auth/register/student: Register a new student.
  -POST /auth/login/student: Student login.
  -POST /auth/login/admin: Admin login.
 -Students:
  -GET /students: Get all students.
  -PUT /students/:id: Update student details (e.g., room number).
 -Admins:
  -GET /admins: Get all admins.
 -Complaints:
  -GET /complaints: Get all complaints.
  -POST /complaints: Create a new complaint.
  -PUT /complaints/:id: Update complaint status.
 -Leaves:
  -GET /leaves: Get all leave requests.
  -POST /leaves: Create a new leave request.
  -PUT /leaves/:id: Update leave status.
 -Canteen Menu:
  -GET /canteen-menu: Get canteen menu.
  -POST /canteen-menu: Add or update canteen menu.
 -Attendance:
  -GET /attendance: Get attendance records.
  -POST /attendance: Mark attendance.
 -Rooms:
  -GET /rooms: Get all rooms.
  -POST /rooms/allocate: Allocate a room based on preferences.
 -Notifications:
  -POST /notifications/send: Send a notification to a student.
 -Hostel Doctors:
  -GET /hostel-doctors: Get hostel doctor details.
  -PUT /hostel-doctors/:id: Update hostel doctor details.
 -Hostel Images:
  -GET /hostel-images: Get hostel images.
 -Hostel Rules:
  -GET /hostel-rules: Get hostel rules.
For more details, refer to the route files in Backend/routes/.

Technologies Used
 -Frontend:
   -React.js
   -Tailwind CSS
   -Vite (build tool)
   -React Router
   -Axios (for API requests)
 -Backend:
   -Node.js
   -Express.js
   -MySQL (database)
   -bcrypt (password hashing)
 -Database:
   -MySQL
Contributing
   -Fork the repository.
   -Create a new branch (git checkout -b feature/your-feature).
   -Make your changes and commit (git commit -m "Add your feature").
   -Push to the branch (git push origin feature/your-feature).
   -Create a pull request.

License
This project is licensed under the MIT License.

Contact
For any inquiries, please contact your-email@example.com.
