const User = require('../models/User');
const Problem = require('../models/Problem');
const Discussion = require('../models/Discussion');
const Contest = require('../models/Contest');

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, problemCount, discussionCount, contestCount] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      Discussion.countDocuments(),
      Contest.countDocuments()
    ]);

    res.json({
      users: userCount,
      problems: problemCount,
      discussions: discussionCount,
      contests: contestCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(100); // Limit for now
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roles } = req.body;
    
    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ message: "Roles must be an array" });
    }

    const user = await User.findByIdAndUpdate(id, { roles }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    
    const user = await User.findByIdAndUpdate(id, { isBanned }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Discussion Moderation
exports.getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ discussions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const discussion = await Discussion.findByIdAndDelete(id);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });
    res.json({ message: "Discussion deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Problem Management
exports.createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ problem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndUpdate(id, req.body, { new: true });
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json({ problem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndDelete(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json({ message: "Problem deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Contest Management
exports.getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: -1 });
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContestById = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id).populate('problems');
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    res.json({ contest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createContest = async (req, res) => {
  try {
    const contest = await Contest.create(req.body);
    res.status(201).json({ contest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findByIdAndUpdate(id, req.body, { new: true });
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    res.json({ contest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findByIdAndDelete(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    
    // Also delete associated problems
    const ContestProblem = require('../models/ContestProblem');
    await ContestProblem.deleteMany({ contestId: id });
    
    res.json({ message: "Contest and its problems deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Contest Problem Management
exports.addContestProblem = async (req, res) => {
  try {
    const { contestId } = req.params;
    const ContestProblem = require('../models/ContestProblem');
    
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const problem = await ContestProblem.create({ ...req.body, contestId });
    
    contest.problems.push(problem._id);
    await contest.save();

    res.status(201).json({ problem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContestProblemById = async (req, res) => {
  try {
    const { problemId } = req.params;
    const ContestProblem = require('../models/ContestProblem');
    const problem = await ContestProblem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json({ problem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContestProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const ContestProblem = require('../models/ContestProblem');
    const problem = await ContestProblem.findByIdAndUpdate(problemId, req.body, { new: true });
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json({ problem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContestProblem = async (req, res) => {
  try {
    const { contestId, problemId } = req.params;
    const ContestProblem = require('../models/ContestProblem');
    
    const problem = await ContestProblem.findByIdAndDelete(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // Remove from contest array
    await Contest.findByIdAndUpdate(contestId, {
      $pull: { problems: problemId }
    });

    res.json({ message: "Problem removed from contest" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
