const Quest = require('../models/Quest');
const QuestProgress = require('../models/QuestProgress');

exports.getAllQuests = async (req, res) => {
  try {
    const quests = await Quest.find();
    res.json(quests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestById = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ message: 'Quest not found' });
    res.json(quest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestProgress = async (req, res) => {
  try {
    const progress = await QuestProgress.findOne({ 
      userId: req.user.id, 
      questId: req.params.questId 
    });
    res.json(progress || { completedNodes: [], activeNode: 1, stars: 0, chestsOpened: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { questId, nodeId, type } = req.body;
    let progress = await QuestProgress.findOne({ userId: req.user.id, questId });

    if (!progress) {
      progress = new QuestProgress({ userId: req.user.id, questId });
    }

    if (type === 'node') {
      if (!progress.completedNodes.includes(nodeId)) {
        progress.completedNodes.push(nodeId);
      }
      // Logic to determine next active node could be more complex
      progress.activeNode = nodeId + 1; 
    } else if (type === 'chest') {
      if (!progress.chestsOpened.includes(nodeId)) {
        progress.chestsOpened.push(nodeId);
        progress.stars += 10; // Reward for opening chest
      }
    }

    progress.updatedAt = Date.now();
    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
