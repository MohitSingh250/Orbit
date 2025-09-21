const Contest = require('../models/Contest');
const User = require('../models/User');

const createContest = async (req, res) => {
  try {
    const { title, problems, startTime, endTime } = req.body;
    if (!title || !problems || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const contest = await Contest.create({ title, problems, startTime, endTime });
    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: -1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems');
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const now = new Date();
    if (now > contest.endTime) {
      return res.status(400).json({ message: 'Contest already ended' });
    }

    // prevent duplicate participant
    const exists = contest.participants.find(
      (p) => String(p.userId) === String(req.user._id)
    );
    if (exists) {
      return res.json({ message: 'Already joined' });
    }

    contest.participants.push({ userId: req.user._id });
    await contest.save();

    // add contest to user's list if not present
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { contestsParticipated: contest._id },
    });

    res.json({ message: 'Joined contest' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createContest, listContests, getContest, joinContest };
