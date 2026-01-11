const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlanController');
const { auth } = require('../middlewares/auth');

router.get('/', studyPlanController.getAllPlans);
router.get('/my', auth, studyPlanController.getMyPlans);
router.get('/:id', studyPlanController.getPlanById);
router.post('/join', auth, studyPlanController.joinPlan);
router.post('/quit', auth, studyPlanController.quitPlan);
router.get('/:planId/progress', auth, studyPlanController.getPlanProgress);
router.post('/progress', auth, studyPlanController.updateProgress);

module.exports = router;
