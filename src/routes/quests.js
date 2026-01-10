const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const { auth } = require('../middlewares/auth');

router.get('/', questController.getAllQuests);
router.get('/:id', questController.getQuestById);
router.get('/progress/:questId', auth, questController.getQuestProgress);
router.post('/progress', auth, questController.updateProgress);

module.exports = router;
