const express = require('express');
const { createContest, listContests, getContest, joinContest } = require('../controllers/contestController');
const { auth, requireRole } = require('../middlewares/auth');
const router = express.Router();

router.get('/', listContests);
router.get('/:id', getContest);
router.post('/', auth, requireRole('admin'), createContest);
router.post('/:id/join', auth, joinContest);

module.exports = router;
