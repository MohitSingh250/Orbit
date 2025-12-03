const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const email = "mscrick01@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
        console.log(`❌ User with email ${email} not found.`);
        process.exit(1);
    }

    console.log(`Found user: ${user.username}`);
    console.log(`Current roles: ${user.roles}`);

    if (!user.roles.includes('admin')) {
        user.roles.push('admin');
    }
    // Ensure 'user' role is also there
    if (!user.roles.includes('user')) {
        user.roles.push('user');
    }
    
    // Deduplicate just in case
    user.roles = [...new Set(user.roles)];

    await user.save();
    console.log(`✅ Updated roles: ${user.roles}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

makeAdmin();
