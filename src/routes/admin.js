const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/adminController');

// All routes require 'admin' role
router.use(auth, requireRole('admin'));

router.get('/stats', ctrl.getDashboardStats);

// Users
router.get('/users', ctrl.getAllUsers);
router.put('/users/:id/role', ctrl.updateUserRole);
router.put('/users/:id/ban', ctrl.banUser);

// Discussions
router.get('/discussions', ctrl.getAllDiscussions);
router.delete('/discussions/:id', ctrl.deleteDiscussion);

// Problems
router.post('/problems', ctrl.createProblem);
router.put('/problems/:id', ctrl.updateProblem);
router.delete('/problems/:id', ctrl.deleteProblem);

// Contests
router.get('/contests', ctrl.getAllContests);
router.get('/contests/:id', ctrl.getContestById);
router.post('/contests', ctrl.createContest);
router.put('/contests/:id', ctrl.updateContest);
router.delete('/contests/:id', ctrl.deleteContest);

router.post('/contests/:contestId/problems', ctrl.addContestProblem);
router.get('/contests/problems/:problemId', ctrl.getContestProblemById);
router.put('/contests/problems/:problemId', ctrl.updateContestProblem);
router.delete('/contests/:contestId/problems/:problemId', ctrl.deleteContestProblem);

module.exports = router;
