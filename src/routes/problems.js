const express = require('express');
const { createProblem, listProblems,randomProblem, getProblem } = require('../controllers/problemController');
const { auth, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Public endpoints
router.get('/', listProblems);
router.get('/random/problem', randomProblem);
router.get('/:id', getProblem);

// Admin endpoint
router.post('/', auth, requireRole('admin'), createProblem);

module.exports = router;