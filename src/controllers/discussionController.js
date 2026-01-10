const Discussion = require('../models/Discussion');
const mongoose = require('mongoose');

const createDiscussion = async (req, res, next) => {
  try {
    const { title, content, problemId, tags, category } = req.body;
    const author = req.user.id;

    const discussion = new Discussion({
      title,
      content,
      author,
      problemId: problemId || undefined,
      tags,
      category: category || 'General'
    });

    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    next(err);
  }
};

const getAllDiscussions = async (req, res, next) => {
  try {
    const { category, tags, sort, q } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (q) filter.title = { $regex: q, $options: 'i' };

    let sortOption = { createdAt: -1 };
    if (sort === 'top') sortOption = { upvotes: -1 };

    const discussions = await Discussion.find(filter)
      .populate('author', 'username profilePicture')
      .populate('problemId', 'title')
      .sort(sortOption)
      .lean();

    res.json(discussions);
  } catch (err) {
    next(err);
  }
};

const getDiscussionsByProblem = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const discussions = await Discussion.find({ problemId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .lean();
    res.json(discussions);
  } catch (err) {
    next(err);
  }
};

const getDiscussionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discussion = await Discussion.findById(id)
      .populate('author', 'username profilePicture')
      .lean();
    
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });
    
    // Increment views
    await Discussion.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    res.json(discussion);
  } catch (err) {
    next(err);
  }
};

const toggleUpvote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const discussion = await Discussion.findById(id);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    const upvoteIndex = discussion.upvotes.indexOf(userId);
    const downvoteIndex = discussion.downvotes.indexOf(userId);

    if (upvoteIndex > -1) {
      discussion.upvotes.splice(upvoteIndex, 1);
    } else {
      discussion.upvotes.push(userId);
      if (downvoteIndex > -1) {
        discussion.downvotes.splice(downvoteIndex, 1);
      }
    }

    await discussion.save();
    res.json({ upvotes: discussion.upvotes.length, downvotes: discussion.downvotes.length });
  } catch (err) {
    next(err);
  }
};

const deleteDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const discussion = await Discussion.findById(id);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    if (discussion.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Discussion.findByIdAndDelete(id);
    res.json({ message: "Discussion deleted" });
  } catch (err) {
    next(err);
  }
};

const getTrendingTopics = async (req, res, next) => {
  try {
    // Get tags from recent discussions
    const discussions = await Discussion.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select('tags')
      .lean();

    const tagCounts = {};
    discussions.forEach(d => {
      d.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const trending = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json(trending);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDiscussion,
  getAllDiscussions,
  getDiscussionsByProblem,
  getDiscussionById,
  toggleUpvote,
  deleteDiscussion,
  getTrendingTopics
};
