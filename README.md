# Hostel-Management

## Overview

*Hostel-Management* is a full-stack web application designed to streamline hostel operations for both students and administrators. The system provides features such as room allocation, community management, complaint and leave management, canteen menu updates, laundry requests, attendance tracking, and general notifications. The application is built with a React frontend, a Node.js backend, and a **PostgreSQL database**, ensuring a robust and scalable solution for hostel management. The application now includes **JWT-based authentication** with secure access and refresh tokens.

## Features

- *Student Features*:
  - Register and log in to access a personalized dashboard with JWT authentication.
  - Apply for leaves and file complaints.
  - Request laundry services.
  - View canteen menu and mark attendance.
  - Allocate rooms based on preferences (e.g., capacity, attached washroom, gallery).
  - View community details (students, admins, hostel doctor, images, and rules).
  - Receive notifications from admins.

- *Admin Features*:
  - Log in to access an admin dashboard with JWT authentication.
  - View and manage student complaints and leave requests.
  - Mark student attendance and update the canteen menu.
  - Allocate rooms to students.
  - Send general notifications to all students.
  - Update hostel doctor information.

- *Superadmin Features*:
  - Superadmin login with JWT authentication.
  - Access to extended administrative capabilities.

- *Public Features*:
  - Access the home page, room allocation, and community sections without authentication.
  - View community details (students, admins, hostel doctor, images, and rules) without logging in.

## Project Structure

The project is divided into three main directories: Backend, Frontend, and Database.

### Directory Structure
```
Hostel-Management/
├── backend/
│   ├── config/
│   │   └── db.js                      # PostgreSQL database connection configuration
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT token verification middleware
│   ├── models/                        # Database models (directory)
│   ├── routes/
│   │   ├── admins.js                  # Routes for admin-related operations
│   │   ├── attendance.js              # Routes for attendance management
│   │   ├── auth.js                    # Routes for authentication (login/register/refresh)
│   │   ├── canteenMenu.js             # Routes for canteen menu management
│   │   ├── complaints.js              # Routes for complaint management
│   │   ├── hostelBookings.js          # Routes for hostel bookings
│   │   ├── hostelDoctors.js           # Routes for hostel doctor management
│   │   ├── hostelImages.js            # Routes for hostel images
│   │   ├── hostelRules.js             # Routes for hostel rules
│   │   ├── laundryNotifications.js    # Routes for laundry notifications
│   │   ├── leaves.js                  # Routes for leave management
│   │   ├── notifications.js           # Routes for notifications
│   │   ├── reservations.js            # Routes for reservations
│   │   ├── rooms.js                   # Routes for room allocation
│   │   ├── students.js                # Routes for student-related operations
│   │   ├── superAdmins.js             # Routes for super-admin operations
│   │   └── test.js                    # Test routes
│   ├── .env                           # Environment variables (database, JWT tokens)
│   ├── .gitignore                     # Git ignore file
│   ├── package.json                   # Backend dependencies and scripts
│   ├── package-lock.json              # Dependency lock file
│   └── server.js                      # Main backend server file
├── database/                          # Database folder (for schema files)
├── frontend/
│   ├── src/
│   │   ├── assets/                    # Static assets (images, fonts)
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
│   │   │   ├── Payment.jsx             # Payment Gateway information
│   │   │   ├── Reservation.jsx         # Room reservation
│   │   │   ├── RoomAllocation.jsx      # Component for room allocation
│   │   │   └── SuperadminAttendanceView.jsx # Attendance view for super admin
│   │   ├── config/
│   │   │   ├── api.js                 # API configuration
│   │   │   └── apiClient.js           # Axios instance with JWT interceptors (NEW)
│   │   ├── pages/
│   │   │   ├── AddStudent.jsx         # Add Student record
│   │   │   ├── AdminDashboard.jsx     # Admin dashboard page
│   │   │   ├── AdminRoomAllocation.jsx # Admin room allocation page
│   │   │   ├── Community.jsx          # Community page
│   │   │   ├── Complaints.jsx         # Complaints page
│   │   │   ├── Dashboard.jsx          # Student dashboard page
│   │   │   ├── Home.jsx               # Home page
│   │   │   ├── Login.jsx              # Login page (updated with JWT)
│   │   │   ├── Profile.jsx            # Profile page
│   │   │   ├── Register.jsx           # Registration page
│   │   │   ├── SendNotification.jsx   # Page for sending notifications (admin)
│   │   │   ├── SuperadminCommunity.jsx # Superadmin community page
│   │   │   ├── SuperadminDashboard.jsx # Superadmin dashboard
│   │   │   └── SuperadminLogin.jsx    # Superadmin login (updated with JWT)
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

- *Node.js* (v16 or higher)
- *npm* (v8 or higher)
- *PostgreSQL* (v12 or higher) - **Changed from MySQL**
- *Git* (for cloning the repository)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Swapnil-008/Hostel-Management.git
cd Hostel-Management
```

### 2. Set Up the Database (PostgreSQL)

#### Option A: Using PostgreSQL Locally
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create a new database:
   ```bash
   createdb hostel_management
   ```

#### Option B: Using Neon PostgreSQL (Cloud-based - Recommended)
1. Sign up for a free account at [neon.tech](https://neon.tech/)
2. Create a new project and database
3. Copy the connection string (it will look like: `postgresql://user:password@host/dbname?sslmode=require`)

### 3. Create Database Tables

Once you have a PostgreSQL database ready, you'll need to create the tables. Use the provided schema or run these commands in your PostgreSQL client:

```sql
-- Run your schema.sql file or create tables as needed
-- The application will help initialize tables on first run
```

### 4. Set Up the Backend

1. Navigate to the Backend Directory:
   ```bash
   cd backend
   ```

2. Install Dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `backend/` directory with the following content:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/hostel_management
   JWT_SECRET=your_super_secret_key_change_in_production
   NODE_ENV=development
   PORT=5000
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```
   
   **Note**: Replace the values with your actual PostgreSQL connection string and secrets.

4. Start the Backend Server:
   ```bash
   npm start
   ```
   
   The backend server will run on `http://localhost:5000`.

### 5. Set Up the Frontend

1. Navigate to the Frontend Directory:
   ```bash
   cd ../frontend
   ```

2. Install Dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the `frontend/` directory with:
   ```
   VITE_API_URL=http://localhost:5000
   ```
   
   For production:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

4. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173` (or the port specified by Vite).

### 6. Access the Application

- Open your browser and navigate to `http://localhost:5173`
- Use the following default credentials to log in:
  - **Admin**: Username: `admin1`, Password: `password`
  - **Student**: Email: `student@example.com`, Password: `password`
  - **Superadmin**: Username: `superadmin1`, Password: `password`

## Authentication (NEW - JWT-based)

The application now uses JWT (JSON Web Tokens) for secure authentication:

- **Access Token**: Short-lived (15 minutes) token for API requests
- **Refresh Token**: Long-lived (7 days) token used to obtain new access tokens
- **Automatic Token Refresh**: Frontend automatically refreshes expired access tokens
- **Token Storage**: Tokens are stored in localStorage for session persistence

### JWT Authentication Flow

1. User logs in → Backend validates credentials and returns `accessToken` and `refreshToken`
2. Frontend stores both tokens in localStorage
3. All API requests include the accessToken in the Authorization header
4. If accessToken expires (401 response), frontend automatically calls `/api/auth/refresh` endpoint
5. Backend issues a new accessToken
6. Frontend retries the original request with the new token
7. On logout, refresh token is invalidated in the database

For detailed JWT implementation information, see [JWT_IMPLEMENTATION_GUIDE.md](JWT_IMPLEMENTATION_GUIDE.md).

## Database Schema

The PostgreSQL database (`hostel_management`) consists of the following tables:

- **students**: Student information (id, name, email, password, room_number, created_at)
- **admins**: Admin information (id, username, password, email, phoneNo, created_at)
- **superadmins**: Superadmin information (id, username, password, email, created_at)
- **complaints**: Student complaints (id, student_id, description, status, created_at)
- **leaves**: Student leave requests (id, student_id, start_date, end_date, reason, status, created_at)
- **canteen_menu**: Daily canteen menu (id, day, menu, created_at)
- **attendance**: Student attendance records (id, student_id, date, status)
- **hostel_bookings**: Hostel booking records (id, student_id, room_number, booking_date, status, created_at)
- **laundry_notifications**: Laundry service requests (id, student_id, request_date, status, created_at)
- **notifications**: Student notifications (id, student_id, message, created_at)
- **rooms**: Room details (id, size, capacity, has_washroom, has_gallery, rent_per_person, total_rent, available)
- **room_preferences**: Student room preferences (id, student_id, preferred_capacity, same_state_preference, attached_washroom, gallery, allocated_room_id)
- **hostel_doctors**: Hostel doctor information (id, name, email, phone_no, specialization, availability, created_at)
- **hostel_rules**: Hostel rules (id, rule_text, created_at)
- **hostel_images**: Hostel images (id, image_url, caption, created_at)
- **refresh_tokens**: JWT refresh tokens (id, user_id, token, user_type, expires_at, created_at) - **NEW**

## API Endpoints

The backend provides the following API routes (base URL: `http://localhost:5000/api`):

### Authentication Endpoints (No Protection Required)
- `POST /auth/register/student` - Register a new student
- `POST /auth/login/student` - Student login (returns accessToken & refreshToken)
- `POST /auth/login/admin` - Admin login (returns accessToken & refreshToken)
- `POST /auth/login/superadmin` - Superadmin login (returns accessToken & refreshToken)
- `POST /auth/refresh` - Refresh access token using refresh token - **NEW**
- `POST /auth/logout` - Logout and invalidate refresh token - **NEW**

### Protected Endpoints (Require JWT Access Token)
All endpoints below require a valid JWT access token in the Authorization header: `Authorization: Bearer <accessToken>`

**Students**
- `GET /students` - Get all students
- `PUT /students/:id` - Update student details

**Admins**
- `GET /admins` - Get all admins

**Complaints**
- `GET /complaints` - Get all complaints
- `POST /complaints` - Create a new complaint
- `PUT /complaints/:id` - Update complaint status

**Leaves**
- `GET /leaves` - Get all leave requests
- `POST /leaves` - Create a new leave request
- `PUT /leaves/:id` - Update leave status

**Canteen Menu**
- `GET /canteen-menu` - Get canteen menu
- `POST /canteen-menu` - Add or update canteen menu

**Attendance**
- `GET /attendance` - Get attendance records
- `POST /attendance` - Mark attendance

**Rooms**
- `GET /rooms` - Get all rooms
- `POST /rooms/allocate` - Allocate a room based on preferences

**Laundry Notifications**
- `GET /laundry-notifications` - Get laundry requests
- `POST /laundry-notifications` - Submit a laundry request
- `PUT /laundry-notifications/:id/accept` - Accept a laundry request

**Notifications**
- `GET /notifications` - Get user notifications
- `POST /notifications/send` - Send a notification

**Hostel Doctors**
- `GET /hostel-doctors` - Get hostel doctor details
- `PUT /hostel-doctors/:id` - Update hostel doctor details

**Hostel Images**
- `GET /hostel-images` - Get hostel images

**Hostel Rules**
- `GET /hostel-rules` - Get hostel rules

### Error Responses
- `401 Unauthorized` - Missing or invalid access token
- `401 Token Expired` - Access token has expired; refresh it using `/auth/refresh`
- `403 Forbidden` - User lacks permission for the requested resource
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Technologies Used

**Frontend:**
- React.js
- Tailwind CSS
- Vite (build tool)
- React Router
- Axios (with JWT interceptors)
- ESLint

**Backend:**
- Node.js
- Express.js
- PostgreSQL (database) - **Changed from MySQL**
- pg (PostgreSQL driver)
- jsonwebtoken (JWT) - **NEW**
- bcrypt (password hashing)
- dotenv (environment variables)
- CORS (cross-origin support)
- Razorpay (payment integration)

**Database:**
- PostgreSQL - **Changed from MySQL**
## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Create a pull request

## Troubleshooting

### Common Issues

**Issue**: "No access token provided" error
- **Solution**: Ensure you're logging in first and that tokens are stored in localStorage

**Issue**: PostgreSQL connection errors
- **Solution**: Verify your DATABASE_URL is correct and PostgreSQL is running

**Issue**: JWT token expired
- **Solution**: The frontend automatically refreshes expired tokens. If you still get auth errors, try logging in again

**Issue**: CORS errors
- **Solution**: Ensure `VITE_API_URL` in frontend .env matches your backend URL

## License

This project is licensed under the MIT License.

## Contact

For any inquiries or support, please contact the project maintainers.
