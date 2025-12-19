// src/routes/advanced.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const ctrl = require('../controllers/advancedController');


router.get('/problems/daily-problem', ctrl.getDailyProblem); // specific first
// router.get('/problems', ctrl.listProblems);                 // REMOVED: Conflicting with problemRoutes
router.get('/problems/:id/stats', async (req, res) => {
  const stats = await ctrl.getProblemStats(req.params.id);
  res.json(stats);
});
router.get('/problems/:id/me', auth, ctrl.getProblemDetailForUser);
router.get('/problems/:id', ctrl.getProblemDetail);          // general last

router.post('/users/me/bookmarks', auth, ctrl.toggleBookmark);
router.get('/users/me/bookmarks', auth, ctrl.getBookmarks);
router.get('/users/me/dashboard', auth, ctrl.getUserDashboard);
router.get('/users/me/streak', auth, ctrl.getUserStreak);
router.get('/stats', ctrl.getGlobalStats);

module.exports = router;