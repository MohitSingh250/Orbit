const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const User = require('../models/User');

/**
 * Create contest (admin)
 */
const createContest = async (req, res) => {
  try {
    const {
      title,
      description = '',
      problems = [],
      startTime,
      endTime,
      ratingAffects = true,
    } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const contest = await Contest.create({
      title,
      description,
      problems,
      startTime,
      endTime,
      ratingAffects,
      participants: [],
      finalized: false,
    });

    res.status(201).json({ message: 'Contest created', contest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * List contests categorized
 */
const listContests = async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find().sort({ startTime: -1 }).lean();

    const categorized = {
      upcoming: contests.filter(c => new Date(c.startTime) > now),
      ongoing: contests.filter(c => new Date(c.startTime) <= now && new Date(c.endTime) >= now),
      past: contests.filter(c => new Date(c.endTime) < now),
    };

    res.json(categorized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get contest details; hide problems before start
 */
const getContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems').lean();
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const now = new Date();
    if (now < new Date(contest.startTime)) {
      // hide problems before start
      const { _id, title, description, startTime, endTime, ratingAffects } = contest;
      return res.json({ _id, title, description, startTime, endTime, ratingAffects, message: 'Contest not started yet' });
    }

    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Join contest: add participant and snapshot ratingBefore
 */
const joinContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const now = new Date();
    if (now > contest.endTime) return res.status(400).json({ message: 'Contest already ended' });

    const already = contest.participants.find(p => String(p.userId) === String(req.user._id));
    if (already) return res.json({ message: 'Already joined' });

    // snapshot user's current rating into participant.ratingBefore
    const user = await User.findById(req.user._id).select('rating');
    const participant = {
      userId: req.user._id,
      score: 0,
      solved: 0,
      lastSubmissionAt: null,
      rank: null,
      ratingBefore: user ? user.rating : null,
      ratingAfter: null,
    };

    contest.participants.push(participant);
    await contest.save();

    // keep user's quick reference (optional)
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { contestsParticipated: contest._id } });

    res.json({ message: 'Joined contest', participant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Add a contest-exclusive problem (admin)
 */
const addContestProblem = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const body = req.body || {};
    const problem = await Problem.create({
      ...body,
      contestExclusive: true,
      contestId: contest._id,
    });

    contest.problems.push(problem._id);
    await contest.save();

    res.status(201).json({ message: 'Problem added', problem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Scoreboard: returns sorted participants (descending by score, then earlier lastSubmissionAt)
 */
const getScoreboard = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('participants.userId', 'username rating').lean();
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const sorted = (contest.participants || []).slice().sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // tie-breaker: earlier lastSubmissionAt wins
      const atA = a.lastSubmissionAt ? new Date(a.lastSubmissionAt).getTime() : Infinity;
      const atB = b.lastSubmissionAt ? new Date(b.lastSubmissionAt).getTime() : Infinity;
      return atA - atB;
    });

    res.json({ scoreboard: sorted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createContest,
  listContests,
  getContest,
  joinContest,
  addContestProblem,
  getScoreboard,
};
