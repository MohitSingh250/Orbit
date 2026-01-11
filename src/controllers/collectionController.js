const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const User = require('../models/User');
const Problem = require('../models/Problem');

const createCollection = async (req, res, next) => {
  try {
    const { name, description, isPrivate } = req.body;
    const userId = req.user._id;

    const collection = new Collection({
      name,
      description,
      isPrivate,
      owner: userId
    });

    await collection.save();

    await User.findByIdAndUpdate(userId, {
      $push: { collections: collection._id }
    });

    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
};

const getCollections = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const collections = await Collection.find({ owner: userId })
      .populate('problems', 'title difficulty topics')
      .sort({ updatedAt: -1 });
    res.json(collections);
  } catch (err) {
    next(err);
  }
};

const getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id)
      .populate('problems', 'title difficulty topics')
      .lean();

    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    // Check privacy
    if (collection.isPrivate && String(collection.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(collection);
  } catch (err) {
    next(err);
  }
};

const updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isPrivate } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    if (String(collection.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (isPrivate !== undefined) collection.isPrivate = isPrivate;

    await collection.save();
    res.json(collection);
  } catch (err) {
    next(err);
  }
};

const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const collection = await Collection.findById(id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    if (String(collection.owner) !== String(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Collection.findByIdAndDelete(id);
    await User.findByIdAndUpdate(userId, {
      $pull: { collections: id }
    });

    res.json({ message: 'Collection deleted' });
  } catch (err) {
    next(err);
  }
};

const addProblemToCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { problemId } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    if (String(collection.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!collection.problems.includes(problemId)) {
      collection.problems.push(problemId);
      await collection.save();
    }

    res.json(collection);
  } catch (err) {
    next(err);
  }
};

const removeProblemFromCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { problemId } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    if (String(collection.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    collection.problems = collection.problems.filter(p => String(p) !== String(problemId));
    await collection.save();

    res.json(collection);
  } catch (err) {
    next(err);
  }
};

const forkCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const original = await Collection.findById(id);
    if (!original) return res.status(404).json({ message: 'Original collection not found' });

    if (original.isPrivate && String(original.owner) !== String(userId)) {
      return res.status(403).json({ message: 'Cannot fork private collection' });
    }

    const forked = new Collection({
      name: `${original.name} (Fork)`,
      description: original.description,
      isPrivate: true,
      owner: userId,
      problems: original.problems,
      forkedFrom: original._id
    });

    await forked.save();
    await User.findByIdAndUpdate(userId, {
      $push: { collections: forked._id }
    });

    res.status(201).json(forked);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  addProblemToCollection,
  removeProblemFromCollection,
  forkCollection
};
