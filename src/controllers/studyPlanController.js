const StudyPlan = require('../models/StudyPlan');
const StudyPlanProgress = require('../models/StudyPlanProgress');
const Problem = require('../models/Problem');

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find().select('-modules'); // Lightweight list
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id)
      .populate({
        path: 'modules.problemIds',
        select: 'title difficulty type' // Minimal problem info for the list
      })
      .populate({
        path: 'relatedPlans',
        select: 'title image' // Minimal info for related widget
      });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlanProgress = async (req, res) => {
  try {
    const { planId } = req.params;
    let progress = await StudyPlanProgress.findOne({ userId: req.user.id, planId });
    
    if (!progress) {
      // Return default structure indicating not started
      return res.json({ solvedProblems: [], isCompleted: false, started: false });
    }
    
    res.json({ ...progress.toObject(), started: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinPlan = async (req, res) => {
  try {
    const { planId, schedule } = req.body;
    
    let progress = await StudyPlanProgress.findOne({ userId: req.user.id, planId });
    if (progress) {
      return res.status(400).json({ message: 'Plan already joined' });
    }

    progress = new StudyPlanProgress({
      userId: req.user.id,
      planId,
      schedule: schedule || { problemsPerDay: 1, daysOfWeek: [] },
      startedAt: Date.now()
    });

    await progress.save();
    res.json({ ...progress.toObject(), started: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.quitPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    await StudyPlanProgress.findOneAndDelete({ userId: req.user.id, planId });
    res.json({ message: 'Plan quit successfully', started: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Start or Update progress (called when a problem is solved, or explicitly started)
exports.updateProgress = async (req, res) => {
  try {
    const { planId, problemId } = req.body;
    
    let progress = await StudyPlanProgress.findOne({ userId: req.user.id, planId });
    if (!progress) {
      // If updating progress without joining, auto-join with default schedule?
      // Or fail? Let's auto-create for robustness.
      progress = new StudyPlanProgress({ userId: req.user.id, planId });
    }
    
    if (problemId && !progress.solvedProblems.includes(problemId)) {
      progress.solvedProblems.push(problemId);
    }
    
    progress.lastAccessedAt = Date.now();
    await progress.save();
    
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPlans = async (req, res) => {
  try {
    const progress = await StudyPlanProgress.find({ userId: req.user.id }).populate('planId');
    // Filter out any where planId might be null (if plan deleted)
    const validProgress = progress.filter(p => p.planId);
    res.json(validProgress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
