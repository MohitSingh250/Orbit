require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const username = 'admin';
    const email = 'admin@orbit.com';
    const password = 'adminpassword';

    // Check if admin already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('Admin user already exists');
      if (!user.roles.includes('admin')) {
        user.roles.push('admin');
        await user.save();
        console.log('Promoted existing user to admin');
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      user = new User({
        username,
        email,
        passwordHash,
        roles: ['user', 'admin'],
        isBanned: false
      });

      await user.save();
      console.log('Admin user created successfully');
    }

    console.log(`Credentials: \nEmail: ${email}\nPassword: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
