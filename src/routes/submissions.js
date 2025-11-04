const express = require('express');
const router = express.Router();
const { submitAnswer, getSubmissionsForUser } = require('../controllers/submissionController');
const { auth } = require('../middlewares/auth');

router.post('/', auth, submitAnswer);
router.get('/user/:userId', auth, getSubmissionsForUser);

module.exports = router;
