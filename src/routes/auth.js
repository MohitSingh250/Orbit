const express = require('express');
const { signup, login, me,googleLogin } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', auth, me);

module.exports = router;
