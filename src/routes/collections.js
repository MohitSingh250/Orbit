const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const ctrl = require('../controllers/collectionController');

router.use(auth);

router.post('/', ctrl.createCollection);
router.get('/', ctrl.getCollections);
router.get('/:id', ctrl.getCollectionById);
router.put('/:id', ctrl.updateCollection);
router.delete('/:id', ctrl.deleteCollection);

router.post('/:id/problems', ctrl.addProblemToCollection);
router.delete('/:id/problems', ctrl.removeProblemFromCollection);
router.post('/:id/fork', ctrl.forkCollection);

module.exports = router;
