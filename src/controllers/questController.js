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
    res.json(progress || { completedNodes: [], solvedProblems: [], activeNode: 1, stars: 0, chestsOpened: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { questId, nodeId, type, problemId } = req.body;
    let progress = await QuestProgress.findOne({ userId: req.user.id, questId });

    if (!progress) {
      progress = new QuestProgress({ userId: req.user.id, questId });
    }

    if (type === 'node') {
      // 1. Mark problem as solved
      if (problemId && !progress.solvedProblems.includes(problemId)) {
        progress.solvedProblems.push(problemId);
      }

      // 2. Check if node is fully complete
      const quest = await Quest.findById(questId);
      let nodeComplete = false;

      // Find the node in the quest
      let targetNode = null;
      for (const section of quest.sections) {
        const found = section.nodes.find(n => n.id === nodeId);
        if (found) {
          targetNode = found;
          break;
        }
      }

      if (targetNode) {
        // Check if all problemIds in targetNode are in solvedProblems
        const allSolved = targetNode.problemIds.every(pid => 
          progress.solvedProblems.includes(pid.toString())
        );
        
        if (allSolved) {
          nodeComplete = true;
          if (!progress.completedNodes.includes(nodeId)) {
            progress.completedNodes.push(nodeId);
            progress.activeNode = nodeId + 1;
          }
        }
      }

      progress.updatedAt = Date.now();
      await progress.save();
      
      // Return extra info so frontend knows if node is finished
      return res.json({ ...progress.toObject(), nodeComplete });

    } else if (type === 'chest') {
      if (!progress.chestsOpened.includes(nodeId)) {
        progress.chestsOpened.push(nodeId);
        progress.stars += 10; // Reward for opening chest
        
        // Auto-advance active node for chests
        if (!progress.completedNodes.includes(nodeId)) {
            progress.completedNodes.push(nodeId);
            progress.activeNode = nodeId + 1;
        }
      }
      await progress.save();
      return res.json(progress);
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
