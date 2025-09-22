// src/routes/advanced.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const ctrl = require('../controllers/advancedController');

router.get('/problems', ctrl.listProblems);
router.get('/problems/daily', ctrl.getDailyProblem);

router.get('/problems/:id', ctrl.getProblemDetail);
router.get('/problems/:id/stats', async (req, res) => {
  const stats = await ctrl.getProblemStats(req.params.id);
  res.json(stats);
});

router.get('/problems/:id/me', auth, ctrl.getProblemDetailForUser);

router.post('/users/me/bookmarks', auth, ctrl.toggleBookmark);
router.get('/users/me/bookmarks', auth, ctrl.getBookmarks);

router.get('/users/me/dashboard', auth, ctrl.getUserDashboard);

module.exports = router;
