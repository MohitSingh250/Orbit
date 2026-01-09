const mongoose = require("mongoose");
const Problem = require("../models/Problem");

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
    const { topic, subject, difficulty, tags, q, page = 1, limit = 20 } = req.query;
    const filters = {};
    if (q && q.trim()) {
      const searchTerms = q.trim().split(/\s+/);
      filters.$and = searchTerms.map(term => ({
        title: { $regex: term, $options: "i" }
      }));
    }

    if (topic) {
      filters.topics = { $in: [new RegExp(topic.trim(), "i")] };
    }

    if (subject) {
      filters.subject = { $regex: `^${subject.trim()}$`, $options: "i" };
    }

    if (difficulty) {
      filters.difficulty = { $regex: `^${difficulty.trim()}$`, $options: "i" };
    }

    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim());
      filters.tags = { $in: tagArray.map((t) => new RegExp(t, "i")) };
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const problems = await Problem.find(filters)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Problem.countDocuments(filters);

    res.json({
      problems,
      total,
      hasMore: total > skip + problems.length,
    });
  } catch (err) {
    next(err);
  }
};

const randomProblem = async (req, res, next) => { 
  console.log("randomProblem")
  try {
    const count = await Problem.countDocuments();
    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne().skip(random).lean();
    res.json(problem);
  } catch (err) {
    next(err);
  }
}

const getProblem = async (req, res, next) => {
  console.log("getProblem")
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid problem id" });
    }

    let problem = await Problem.findById(id)
      .populate('similarProblems', 'title difficulty')
      .lean();
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // Fallback: If no similar problems linked, find some automatically
    // Fallback: If no similar problems linked, find some automatically using weighted aggregation
    if (!problem.similarProblems || problem.similarProblems.length === 0) {
      const similarAgg = await Problem.aggregate([
        {
          $match: {
            _id: { $ne: problem._id }, // Exclude current problem
            subject: problem.subject,  // Strict subject match
            $or: [
              { tags: { $in: problem.tags || [] } },
              { topics: { $in: problem.topics || [] } }
            ]
          }
        },
        {
          $addFields: {
            // Calculate score based on matches
            score: {
              $add: [
                // +4 points for each matching tag (High relevance)
                { 
                  $multiply: [
                    4, 
                    { 
                      $size: { 
                        $setIntersection: ["$tags", problem.tags || []] 
                      } 
                    } 
                  ] 
                },
                // +2 points for each matching topic
                { 
                  $multiply: [
                    2, 
                    { 
                      $size: { 
                        $setIntersection: ["$topics", problem.topics || []] 
                      } 
                    } 
                  ] 
                },
                // +3 points if difficulty matches
                { 
                  $cond: [
                    { $eq: ["$difficulty", problem.difficulty] }, 
                    3, 
                    0 
                  ] 
                }
              ]
            }
          }
        },
        { $match: { score: { $gte: 3 } } }, // Minimum quality threshold
        { $sort: { score: -1, createdAt: -1 } }, // Sort by score desc, then newest
        { $limit: 3 }, // Top 3 only
        { $project: { title: 1, difficulty: 1, _id: 1 } } // Only needed fields
      ]);

      problem.similarProblems = similarAgg;
    }

    res.json(problem);
  } catch (err) {
    next(err);
  }
};



const getDailyProblem = async (req, res, next) => {
  try {
    const count = await Problem.countDocuments();
    if (count === 0) return res.status(404).json({ message: "No problems found" });

    // Use date string to seed the random selection
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = today.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % count;

    const problem = await Problem.findOne().skip(index).lean();
    res.json(problem);
  } catch (err) {
    next(err);
  }
};

const getTopics = async (req, res, next) => {
  try {
    const topics = await Problem.aggregate([
      { $unwind: "$topics" },
      { $sort: { subject: -1 } },
      {
        $group: {
          _id: "$topics",
          count: { $sum: 1 },
          subject: { $first: "$subject" }
        }
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          label: "$_id",
          count: 1,
          subject: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(topics);
  } catch (err) {
    next(err);
  }
};

const getTags = async (req, res, next) => {
  try {
    const tags = await Problem.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          label: "$_id",
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(tags);
  } catch (err) {
    next(err);
  }
};

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Problem.distinct("subject");
    // Map to a consistent format if needed, or just return the strings
    res.json(subjects.filter(Boolean));
  } catch (err) {
    next(err);
  }
};

module.exports = { createProblem, listProblems, getProblem, randomProblem, getDailyProblem, getTopics, getTags, getSubjects };
