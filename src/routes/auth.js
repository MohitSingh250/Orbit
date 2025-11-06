const express = require('express');
const { signup, login, me,googleLogin,updateProfile,uploadAvatar } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const router = express.Router();
const { upload } = require("../config/cloudinary");

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', auth, me);
router.put("/me",auth,updateProfile)
router.post("/me/avatar", auth, upload.single("avatar"), uploadAvatar);

module.exports = router;