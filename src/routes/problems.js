const express = require('express');
const { createProblem, listProblems,randomProblem, getProblem } = require('../controllers/problemController');
const { auth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.post('/create-problem', auth, requireRole('admin'), createProblem);
// Public endpoints
router.get('/', listProblems);
router.get('/random/problem', randomProblem);
router.get('/:id', getProblem);




module.exports = router;