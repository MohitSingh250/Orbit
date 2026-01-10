const Comment = require('../models/Comment');
const Discussion = require('../models/Discussion');

const addComment = async (req, res, next) => {
  try {
    const { content, discussionId, parentId } = req.body;
    const author = req.user.id;

    const comment = new Comment({
      content,
      author,
      discussionId,
      parentId: parentId || null
    });

    await comment.save();
    
    // Populate author before sending back
    await comment.populate('author', 'username profilePicture');

    // Update comment count in discussion
    await Discussion.findByIdAndUpdate(discussionId, { $inc: { commentCount: 1 } });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

const getCommentsByDiscussion = async (req, res, next) => {
  try {
    const { discussionId } = req.params;
    const { sort } = req.query;
    
    let sortOption = { createdAt: 1 };
    if (sort === 'best') {
      // We can't directly sort by array length in find, so we might need to aggregate 
      // or just sort in memory if the number of comments is small.
      // For now, let's sort by createdAt and handle "Best" in memory or just use a simple sort.
      // Actually, let's use aggregation if we want real sorting.
    }

    const allComments = await Comment.find({ discussionId })
      .populate('author', 'username profilePicture')
      .sort(sortOption)
      .lean();

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter(c => !c.parentId);
    const replies = allComments.filter(c => c.parentId);

    // Attach replies to their parents
    const structuredComments = topLevelComments.map(parent => {
      return {
        ...parent,
        replies: replies.filter(r => r.parentId.toString() === parent._id.toString())
      };
    });

    if (sort === 'best') {
      structuredComments.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
    } else if (sort === 'newest') {
      structuredComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(structuredComments);
  } catch (err) {
    next(err);
  }
};

const toggleCommentUpvote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const upvoteIndex = comment.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      comment.upvotes.splice(upvoteIndex, 1);
    } else {
      comment.upvotes.push(userId);
    }

    await comment.save();
    res.json({ upvotes: comment.upvotes.length });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
// ... existing code ...
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Comment.findByIdAndDelete(id);
    
    // Update comment count in discussion
    await Discussion.findByIdAndUpdate(comment.discussionId, { $inc: { commentCount: -1 } });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addComment,
  getCommentsByDiscussion,
  deleteComment,
  toggleCommentUpvote
};
