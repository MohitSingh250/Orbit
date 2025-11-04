const express = require('express');
const router = express.Router();
const {
  createContest,
  listContests,
  getContest,
  joinContest,
  addContestProblem,
  getScoreboard,
} = require('../controllers/contestController');
const { finalizeContest } = require('../controllers/ratingController');
const { auth, requireRole } = require('../middlewares/auth');

router.get('/', listContests);
router.get('/:id', getContest);
router.get('/:id/scoreboard', getScoreboard);

// admin
router.post('/', auth, requireRole('admin'), createContest);
router.post('/:id/add-problem', auth, requireRole('admin'), addContestProblem);
router.post('/:id/finalize', auth, requireRole('admin'), finalizeContest);

// participant
router.post('/:id/join', auth, joinContest);

module.exports = router;
