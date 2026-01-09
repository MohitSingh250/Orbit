const express = require('express');
const { createProblem, listProblems,randomProblem, getProblem, getTags, getSubjects } = require('../controllers/problemController');
const { auth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.post('/create-problem', createProblem);
// Public endpoints
router.get('/', listProblems);
router.get('/daily-problem', require('../controllers/problemController').getDailyProblem);
router.get('/random/problem', randomProblem);
router.get('/topics', require('../controllers/problemController').getTopics);
router.get('/tags', getTags);
router.get('/subjects', getSubjects);
router.get('/:id', getProblem);




module.exports = router;