const express = require('express');
const { submitAnswer, getSubmissionsForUser, getSubmissionsForProblem, submitBulkAnswers } = require('../controllers/submissionController');
const { auth } = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth, submitAnswer);
router.post('/bulk', auth, submitBulkAnswers);
router.get('/user/:userId', auth, getSubmissionsForUser);
router.get('/problem/:problemId', auth, getSubmissionsForProblem);

module.exports = router;