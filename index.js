require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middlewares/errorHandler');

const authRoutes = require('./src/routes/auth');
const problemRoutes = require('./src/routes/problems');
const submissionRoutes = require('./src/routes/submissions');
const advancedRoutes = require('./src/routes/advanced');
const contestRoutes = require('./src/routes/contests');
const leaderboardRoutes = require('./src/routes/leaderboard');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', advancedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/contests', contestRoutes);

app.use(errorHandler);
const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect DB', err);
});
