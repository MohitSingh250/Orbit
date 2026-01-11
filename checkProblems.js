require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const total = await Problem.countDocuments();
    const practice = await Problem.countDocuments({ usage: 'practice' });
    const quest = await Problem.countDocuments({ usage: 'quest' });
    const missingUsage = await Problem.countDocuments({ usage: { $exists: false } });
    
    console.log(`Total Problems: ${total}`);
    console.log(`Practice: ${practice}`);
    console.log(`Quest: ${quest}`);
    console.log(`Missing Usage: ${missingUsage}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
