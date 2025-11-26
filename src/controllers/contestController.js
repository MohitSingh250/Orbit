const Contest = require("../models/Contest");
const ContestProblem = require("../models/ContestProblem");
const User = require("../models/User");


const createContest = async (req, res) => {
  try {
    const contest = new Contest(req.body);
    await contest.save();

    return res.status(201).json({ success: true, contest });
  } catch (err) {
    console.error("Create Contest Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const addContestProblem = async (req, res) => {
  try {
    const { contestId } = req.params;
    const problemData = req.body;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const contestProblem = new ContestProblem({
      ...problemData,
      contestId,
    });

    await contestProblem.save();

    contest.problems.push(contestProblem._id);
    await contest.save();

    return res.status(201).json({
      success: true,
      message: "Contest problem added",
      problem: contestProblem,
    });
  } catch (err) {
    console.error("Add Contest Problem Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------------------------------------------------
// REGISTER USER FOR CONTEST (updated for participant object)
// -------------------------------------------------------------
const registerForContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const exists = contest.participants.find(
      (p) => String(p.userId) === String(userId)
    );

    if (exists) {
      return res.json({ message: "Already registered" });
    }

    contest.participants.push({
      userId,
      score: 0,
      solved: 0,
      lastSubmissionAt: null,
    });

    await contest.save();

    return res.json({
      success: true,
      message: "Registered for contest successfully",
    });
  } catch (err) {
    console.error("Contest Registration Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------------------------------------------------
// GET ALL CONTESTS
// -------------------------------------------------------------
const getContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: 1 }).lean();
    return res.json({ success: true, contests });
  } catch (err) {
    console.error("Get Contests Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------------------------------------------------
// GET SINGLE CONTEST WITH POPULATIONS
// -------------------------------------------------------------
// -------------------------------------------------------------
// GET SINGLE CONTEST WITH POPULATIONS (SECURE)
// -------------------------------------------------------------
const getContestById = async (req, res) => {
  try {
    const { contestId } = req.params;

    // 1. Fetch contest WITHOUT problems first
    const contest = await Contest.findById(contestId)
      .populate("participants.userId", "username rating avatar")
      .lean();

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // 2. Security Check: Has the contest started?
    const now = new Date();
    const hasStarted = now >= new Date(contest.startTime);

    // 3. If started, fetch problems securely (excluding answers)
    if (hasStarted) {
      const problems = await ContestProblem.find({ contestId: contest._id })
        .select("-correctAnswer -solution"); // CRITICAL: Exclude answers
      
      contest.problems = problems;
    } else {
      // If not started, hide problems entirely
      contest.problems = [];
    }

    return res.json({ success: true, contest });
  } catch (err) {
    console.error("Get Contest Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------------------------------------------------
// DELETE CONTEST (+ DELETE ITS PROBLEMS)
// -------------------------------------------------------------
const deleteContest = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    await ContestProblem.deleteMany({ contestId });
    await contest.deleteOne();

    return res.json({ success: true, message: "Contest deleted" });
  } catch (err) {
    console.error("Delete Contest Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
module.exports = {
  createContest,
  addContestProblem,
  registerForContest,
  getContests,
  getContestById,
  deleteContest,
};
