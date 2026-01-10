const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const commentController = require('../controllers/commentController');
const { auth } = require('../middlewares/auth');
const { discussionUpload } = require('../config/cloudinary');

// Discussion Routes
router.get('/', discussionController.getAllDiscussions);
router.post('/', auth, discussionController.createDiscussion);
const uploadMiddleware = (req, res, next) => {
  discussionUpload.single('image')(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary Error:", err);
      return res.status(500).json({ message: err.message || "Image upload failed" });
    }
    next();
  });
};

router.post('/upload', auth, uploadMiddleware, (req, res) => {
  console.log('Upload request received');
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }
  console.log('File uploaded to:', req.file.path);
  res.json({ url: req.file.path });
});
router.get('/problem/:problemId', discussionController.getDiscussionsByProblem);
router.get('/trending', discussionController.getTrendingTopics);
router.get('/:id', discussionController.getDiscussionById);
router.post('/:id/upvote', auth, discussionController.toggleUpvote);
router.delete('/:id', auth, discussionController.deleteDiscussion);

// Comment Routes
router.post('/comments', auth, commentController.addComment);
router.post('/comments/:id/upvote', auth, commentController.toggleCommentUpvote);
router.get('/:discussionId/comments', commentController.getCommentsByDiscussion);
router.delete('/comments/:id', auth, commentController.deleteComment);

module.exports = router;
