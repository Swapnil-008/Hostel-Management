# Hostel Management System

A digital solution to manage hostel operations including complaints, leave requests, and more.

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Update `.env` with your PostgreSQL credentials.
4. Run database scripts: 
   - `psql -U your_username -f database/schema.sql`
   - `psql -U your_username -d hostel_management -f database/seed.sql`
5. `npm start`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Prerequisites
- Node.js
- PostgreSQL