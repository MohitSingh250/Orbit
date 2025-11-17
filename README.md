Orbit – Physics Learning Platform (Backend)

This repository contains the backend API for Orbit, an advanced physics-learning platform featuring structured problem solving, contests, daily problems, submissions, streaks, dashboards, and more.

Built using Node.js, Express.js, MongoDB, JWT, Google OAuth, and Cloudinary.

🚀 Tech Stack

Node.js + Express 5
MongoDB + Mongoose
JWT Authentication
Google OAuth (google-auth-library)
Cloudinary + multer + multer-storage-cloudinary
bcryptjs
CORS
dotenv
nodemon

📁 Project Structure

src/
├─ config/
│ ├─ cloudinary.js
│ └─ db.js
├─ controllers/
├─ middlewares/
├─ models/
├─ routes/
│ ├─ auth.js
│ ├─ advanced.js
│ ├─ problems.js
│ └─ submissions.js
├─ scripts/seed.js
└─ index.js

🔧 Environment Variables

Create a .env file:

PORT=4000
MONGO_URI=your-mongodb-atlas
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

📌 API ROUTES (Updated from Your Code)
🔐 AUTH ROUTES (/api/auth)
Method	Endpoint	Description
POST	/signup	Register account
POST	/login	Login with email/password
POST	/google	Google OAuth login
GET	/me	Get authenticated user
PUT	/me	Update profile details
POST	/me/avatar	Upload avatar (Cloudinary)
POST	/refresh	Refresh JWT token
🧠 ADVANCED USER FEATURES (/api)
Problems
Method	Endpoint	Description
GET	/problems/daily-problem	Get Daily Physics Problem
GET	/problems	List problems
GET	/problems/:id	Get problem detail
GET	/problems/:id/me	User-specific problem info
GET	/problems/:id/stats	Problem correctness/stats
User Dashboard
Method	Endpoint	Description
GET	/users/me/dashboard	Full dashboard: solved, stats, streak
GET	/users/me/streak	Get solving streak
POST	/users/me/bookmarks	Toggle bookmark
GET	/users/me/bookmarks	Get bookmarked problems
📝 PROBLEM ROUTES (/api/problems)
Method	Endpoint	Description
GET	/	List all problems
GET	/random/problem	Get random problem
GET	/:id	Get problem by ID
🧪 SUBMISSION ROUTES (/api/submissions)
Method	Endpoint	Description
POST	/	Submit an answer
GET	/user/:userId	Get user submission history
🛠️ Setup Instructions
1. Clone repository
git clone https://github.com/MohitSingh250/Orbit.git
cd Orbit

2. Install dependencies
npm install

3. Start development
npm run dev

4. Production server
npm start

