const express = require('express');
const { submitAnswer, getSubmissionsForUser, submitBulkAnswers } = require('../controllers/submissionController');
const { auth } = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth, submitAnswer);
router.post('/bulk', auth, submitBulkAnswers);
router.get('/user/:userId', auth, getSubmissionsForUser);

module.exports = router;