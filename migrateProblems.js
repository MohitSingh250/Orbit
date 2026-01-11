require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const result = await Problem.updateMany(
      { usage: { $exists: false } },
      { $set: { usage: 'practice' } }
    );
    
    console.log(`Matched ${result.matchedCount} documents`);
    console.log(`Modified ${result.modifiedCount} documents`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
