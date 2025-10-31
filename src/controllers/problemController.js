const mongoose = require('mongoose');
const Problem = require('../models/Problem');

const createProblem = async (req, res, next) => {
  try {
    const payload = req.body;
    const problem = await Problem.create(payload);
    res.status(201).json(problem);
  } catch (err) {
    next(err);
  }
};

const listProblems = async (req, res, next) => {
  try {
    const { topic, difficulty, tags, q, page = 1, limit = 20 } = req.query;

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


    res.json(problems);
  } catch (err) {
    next(err);
  }
};

// 3️⃣ Get single problem by ID
const getProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!new mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    const problem = await Problem.findById(id).lean();
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    res.json(problem);
  } catch (err) {
    next(err);
  }
};

module.exports = { createProblem, listProblems, getProblem };
