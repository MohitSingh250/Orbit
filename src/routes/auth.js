const express = require('express');
const { signup, login, me,googleLogin,updateProfile } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', auth, me);
router.put("/me",auth,updateProfile)

module.exports = router;
