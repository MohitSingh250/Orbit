require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User'); // Register User model
const { getLeaderboard } = require('../controllers/leaderboardController');

// Mock Express Request/Response
const req = {
  params: { contestId: '6925fa5639aaa62e7946f9f3' } // ID from previous inspection
};

const res = {
  json: (data) => {
    console.log('✅ Controller Response:', JSON.stringify(data, null, 2));
  },
  status: (code) => {
    console.log(`❌ Status Code: ${code}`);
    return {
      json: (data) => console.log('❌ Error Response:', data)
    };
  }
};

async function testController() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('🚀 Testing getLeaderboard controller...');
    
    await getLeaderboard(req, res);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Script Error:', err);
    process.exit(1);
  }
}

testController();
