const express = require('express');
const { createProblem, listProblems, getProblem } = require('../controllers/problemController');
const { auth, requireRole } = require('../middlewares/auth');
const router = express.Router();

router.get('/', listProblems);
router.get('/:id', getProblem);
router.post('/', auth, requireRole('admin'), createProblem);

module.exports = router;
