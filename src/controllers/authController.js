const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: 'User exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, passwordHash: hash });
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {expiresIn:"1d"}
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    );

    res.status(201).json({ token,refreshToken });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {expiresIn:"1d"}
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    );

    res.json({ token,refreshToken });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try{
    const {refreshToken}=req.body;
    if(!refreshToken){
      return res.status(401).json({message:"No token provided"});
    }
    const payload=jwt.verify(refreshToken,process.env.JWT_SECRET);
    const token = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET,
      {expiresIn:"1d"}
    );
    const newRefreshToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    );
    res.json({token,refreshToken: newRefreshToken });
    req.user={ id: payload.id };
  }catch(err){
    return res.status(401).json({message:"Invalid token"});
  }
}


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body; 

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); 
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
        email,
        passwordHash: await bcrypt.hash(googleId, 10), 
      });
    }

    const myToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({ token: myToken, user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Google login failed' });
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, location, avatar, oldPassword, newPassword } = req.body;

    if (username) user.username = username;
    if (location) user.location = location;
    if (avatar) user.avatar = avatar;

    // Password update (only if both old & new provided)
    if (oldPassword && newPassword) {
      const valid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!valid)
        return res.status(400).json({ message: "Old password incorrect" });

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        location: user.location,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file || !req.file.path)
      return res.status(400).json({ message: "No image uploaded" });

    const user = req.user;
    user.avatar = req.file.path; // Cloudinary URL
    await user.save();

    res.json({ message: "Avatar uploaded", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};


const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};




module.exports = { signup, login, me ,googleLogin,updateProfile,uploadAvatar,refresh };