const mongoose = require('mongoose');
const StudyPlan = require('./src/models/StudyPlan');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const plans = await StudyPlan.find({ isFeatured: true });
  console.log(`Found ${plans.length} featured plans.`);
  plans.forEach(p => console.log(`- ${p.title} (${p.image})`));
  process.exit();
}

check();
