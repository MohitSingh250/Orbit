const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const checkRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const users = await User.find({}, 'username email roles');
    console.log("--- Users ---");
    users.forEach(u => {
        console.log(`User: ${u.username} (${u.email}) | Roles: ${JSON.stringify(u.roles)}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkRoles();
