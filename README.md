Orbit – Physics Learning Platform (Backend)

This repository contains the backend API for Orbit, an advanced physics-learning platform featuring structured problem solving, contests, daily problems, submissions, streaks, dashboards, and more.

Built using Node.js, Express.js, MongoDB, JWT, Google OAuth, and Cloudinary.

🚀 Tech Stack

- **Node.js + Express 5**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Google OAuth** (google-auth-library)
- **Cloudinary** (File uploads)
- **bcryptjs** (Password hashing)
- **CORS** & **dotenv**

📁 Project Structure

```
Orbit/
├─ src/
│ ├─ config/
│ │ ├─ cloudinary.js
│ │ └─ db.js
│ ├─ controllers/
│ ├─ middlewares/
│ ├─ models/
│ ├─ routes/
│ │ ├─ auth.js
│ │ ├─ advanced.js
│ │ ├─ problems.js
│ │ ├─ submissions.js
│ │ ├─ contests.js
│ │ └─ leaderboard.js
│ ├─ scripts/
│ │ └─ seed.js
│ └─ utils/
├─ .env
├─ index.js
├─ package.json
└─ README.md
```

🔧 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

📌 API Routes

### 🔐 Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/signup` | Register new account |
| POST | `/login` | Login with email/password |
| POST | `/google` | Google OAuth login |
| GET | `/me` | Get current authenticated user |
| PUT | `/me` | Update profile details |
| POST | `/me/avatar` | Upload avatar |
| POST | `/refresh` | Refresh JWT token |

### 📝 Problem Routes (`/api/problems`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | List all problems |
| GET | `/random/problem` | Get a random problem |
| GET | `/:id` | Get problem details by ID |
| GET | `/:id/me` | Get user-specific problem info |
| GET | `/:id/stats` | Get problem statistics |
| GET | `/daily-problem` | Get the daily challenge |

### 🧪 Submission Routes (`/api/submissions`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/` | Submit an answer |
| GET | `/user/:userId` | Get submission history for a user |

### 🏆 Contest Routes (`/api/contests`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | List contests |
| POST | `/` | Create a contest |
| GET | `/:id` | Get contest details |
| POST | `/:id/register` | Register for a contest |

### 📊 Leaderboard Routes (`/api/leaderboards`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/global` | Global leaderboard |

### 🧠 Advanced Features (`/api`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/users/me/dashboard` | User dashboard stats |
| GET | `/users/me/streak` | User streak info |
| POST | `/users/me/bookmarks` | Toggle bookmark |
| GET | `/users/me/bookmarks` | List bookmarks |

🛠️ Setup Instructions

1. **Clone repository**
   ```bash
   git clone https://github.com/MohitSingh250/Orbit.git
   cd Orbit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   node index.js
   ```

