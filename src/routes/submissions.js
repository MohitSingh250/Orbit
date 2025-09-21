const express = require('express');
const { submitAnswer, getSubmissionsForUser } = require('../controllers/submissionController');
const { auth } = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth, submitAnswer);
router.get('/user/:userId', auth, getSubmissionsForUser);

module.exports = router;
