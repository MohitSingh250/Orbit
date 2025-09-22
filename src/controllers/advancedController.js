// src/controllers/advancedController.js
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');

// 1) List problems with filters and search
const listProblems = async (req, res, next) => {
  try {
    const { topic, difficulty, q, tags, page = 1, limit = 20 } = req.query;

    const andFilters = [];
    if (q) andFilters.push({ $text: { $search: q } });
    if (topic) andFilters.push({ topics: { $in: [new RegExp(`^${topic.trim()}$`, 'i')] } });
    if (difficulty) andFilters.push({ difficulty: { $regex: new RegExp(`^${difficulty.trim()}$`, 'i') } });
    if (tags) {
      const tagArray = tags.split(',').map(t => new RegExp(`^${t.trim()}$`, 'i'));
      andFilters.push({ tags: { $in: tagArray } });
    }

    const filter = andFilters.length ? { $and: andFilters } : {};

    const skip = (Math.max(1, page) - 1) * limit;

    const problems = await Problem.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    console.log("Final filter:", JSON.stringify(filter, null, 2));
    console.log("Problems found:", problems.length);

    res.json(problems);
  } catch (err) {
    next(err);
  }
};


const getProblemDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid problem id' });

    const problem = await Problem.findById(id).populate('similarProblems', 'title difficulty topics').lean();
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const stats = await getProblemStats(id);
    res.json({ ...problem, stats });
  } catch (err) {
    next(err);
  }
};

const getProblemDetailForUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid problem id' });

    const problem = await Problem.findById(id).populate('similarProblems', 'title difficulty topics').lean();
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const stats = await getProblemStats(id);

    const user = await User.findById(req.user._id).lean();
    const noteObj = (user.notes || []).find(n => String(n.problemId) === String(id));
    const userNote = noteObj ? noteObj.note : null;
    const bookmarked = (user.bookmarks || []).some(b => String(b) === String(id));
    const userSubmissions = await Submission.find({ userId: user._id, problemId: id }).sort({ createdAt: -1 }).lean();

    res.json({ ...problem, stats, userNote, bookmarked, userSubmissions });
  } catch (err) {
    next(err);
  }
};

// 3) Problem stats aggregation
const getProblemStats = async (problemId) => {
  const pid = mongoose.Types.ObjectId(problemId);

  const solversAgg = await Submission.aggregate([
    { $match: { problemId: pid, isCorrect: true } },
    { $group: { _id: '$userId' } },
    { $count: 'uniqueSolvers' }
  ]);
  const uniqueSolvers = solversAgg.length ? solversAgg[0].uniqueSolvers : 0;

  const participantsAgg = await Submission.aggregate([
    { $match: { problemId: pid } },
    { $group: { _id: '$userId' } },
    { $count: 'uniqueParticipants' }
  ]);
  const uniqueParticipants = participantsAgg.length ? participantsAgg[0].uniqueParticipants : 0;

  const percentSolved = uniqueParticipants === 0 ? 0 : (uniqueSolvers / uniqueParticipants) * 100;

  const timeAgg = await Submission.aggregate([
    { $match: { problemId: pid, isCorrect: true, timeTakenMs: { $ne: null } } },
    { $sort: { userId: 1, createdAt: 1 } },
    { $group: { _id: '$userId', firstTimeTaken: { $first: '$timeTakenMs' } } },
    { $group: { _id: null, times: { $push: '$firstTimeTaken' } } },
    { $project: { times: 1 } }
  ]);
  let medianTimeMs = null;
  if (timeAgg.length && timeAgg[0].times.length) {
    const times = timeAgg[0].times.sort((a, b) => a - b);
    const mid = Math.floor(times.length / 2);
    medianTimeMs = (times.length % 2 === 1) ? times[mid] : Math.round((times[mid - 1] + times[mid]) / 2);
  }

  const attemptsAgg = await Submission.aggregate([
    { $match: { problemId: pid } },
    { $sort: { createdAt: 1 } },
    { $group: { _id: '$userId', submissions: { $push: { isCorrect: '$isCorrect' } } } },
    {
      $project: {
        isCorrectArr: { $map: { input: '$submissions', as: 's', in: '$$s.isCorrect' } }
      }
    },
    {
      $project: {
        attemptsToAccept: {
          $let: {
            vars: { idx: { $indexOfArray: ['$isCorrectArr', true] } },
            in: { $cond: [{ $gte: ['$$idx', 0] }, { $add: ['$$idx', 1] }, { $size: '$isCorrectArr' }] }
          }
        }
      }
    },
    { $group: { _id: '$attemptsToAccept', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const attemptDistribution = {};
  for (const item of attemptsAgg) {
    attemptDistribution[item._id] = item.count;
  }

  return {
    uniqueSolvers,
    uniqueParticipants,
    percentSolved: Number(percentSolved.toFixed(2)),
    medianTimeMs,
    attemptDistribution
  };
};

// 4) Toggle bookmark
const toggleBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(problemId)) return res.status(400).json({ message: 'Invalid problemId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const exists = user.bookmarks.some(b => String(b) === String(problemId));
    if (exists) {
      user.bookmarks = user.bookmarks.filter(b => String(b) !== String(problemId));
      await user.save();
      return res.json({ message: 'Removed bookmark' });
    } else {
      user.bookmarks.push(problemId);
      await user.save();
      return res.json({ message: 'Added bookmark' });
    }
  } catch (err) {
    next(err);
  }
};

// 5) Get bookmarks list
const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks', 'title difficulty topics').lean();
    res.json(user.bookmarks || []);
  } catch (err) {
    next(err);
  }
};

// 6) Daily problem
const getDailyProblem = async (req, res, next) => {
  try {
    const dateKey = new Date().toISOString().slice(0, 10);
    const count = await Problem.countDocuments();
    if (count === 0) return res.status(404).json({ message: 'No problems available' });

    const seed = Array.from(dateKey).reduce((s, c) => s + c.charCodeAt(0), 0);
    const idx = seed % count;
    const problem = await Problem.findOne().skip(idx).lean();
    res.json(problem);
  } catch (err) {
    next(err);
  }
};

// 7) User dashboard
const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('solvedProblems', 'title difficulty topics').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const agg = await Submission.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$isCorrect', count: { $sum: 1 } } }
    ]);
    let correct = 0, total = 0;
    agg.forEach(a => {
      total += a.count;
      if (a._id === true) correct = a.count;
    });
    const accuracy = total === 0 ? 0 : (correct / total) * 100;

    const topicAgg = await Submission.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'problem' } },
      { $unwind: '$problem' },
      { $unwind: { path: '$problem.topics', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { topic: '$problem.topics', isCorrect: '$isCorrect' }, count: { $sum: 1 } } }
    ]);

    const topicStats = {};
    topicAgg.forEach(r => {
      const t = r._id.topic || 'Unknown';
      topicStats[t] = topicStats[t] || { attempts: 0, correct: 0 };
      topicStats[t].attempts += r.count;
      if (r._id.isCorrect === true) topicStats[t].correct += r.count;
    });
    Object.keys(topicStats).forEach(t => {
      topicStats[t].accuracy = topicStats[t].attempts === 0 ? 0 :
        Number(((topicStats[t].correct / topicStats[t].attempts) * 100).toFixed(2));
    });

    const notes = (user.notes || []).map(n => ({ problemId: n.problemId, note: n.note, createdAt: n.createdAt }));
    const bookmarks = (user.bookmarks || []);

    res.json({
      username: user.username,
      rating: user.rating,
      totalSolved: (user.solvedProblems || []).length,
      accuracy: Number(accuracy.toFixed(2)),
      topicStats,
      solvedProblems: user.solvedProblems,
      notes,
      bookmarks
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listProblems,
  getProblemDetail,
  getProblemDetailForUser,
  getProblemStats,
  toggleBookmark,
  getBookmarks,
  getDailyProblem,
  getUserDashboard
};
