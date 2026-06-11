const Module = require('../models/Module');
const { validationResult } = require('express-validator');

const parseQueryList = (value) => (
  Array.isArray(value) ? value : value.split(',')
).map((item) => item.trim()).filter(Boolean);

const submittedStatuses = ['Submitted', 'Pending Review'];

// GET /modules
const getModules = async (req, res) => {
  try {
    const {
      program,
      category,
      tags,
      collaborators,
      createdFrom,
      createdTo,
      status,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};
    const andConditions = [];

    if (program) filter.program = program;
    if (category) {
      const categoryArray = parseQueryList(category);
      filter.category = categoryArray.length > 1 ? { $in: categoryArray } : categoryArray[0];
    }
    if (status) filter.status = status;

    if (tags) {
      const tagArray = parseQueryList(tags);
      filter.tags = { $in: tagArray };
    }

    if (collaborators) {
      const collabArray = parseQueryList(collaborators);
      andConditions.push({
        $or: [
          { collaborators: { $in: collabArray } },
          { author: { $in: collabArray } },
        ],
      });
    }

    if (createdFrom || createdTo) {
      filter.createdAt = {};
      if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
      if (createdTo) filter.createdAt.$lte = new Date(createdTo);
    }

    if (search) {
      andConditions.push({
        $or: [
          { moduleName: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Module.countDocuments(filter);
    const modules = await Module.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const liveCount = await Module.countDocuments({ ...filter, status: { $in: ['Approved', 'Active'] } });
    const draftCount = await Module.countDocuments({ ...filter, status: 'Draft' });

    res.json({
      success: true,
      data: modules,
      meta: {
        total,
        liveCount,
        draftCount,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /modules/:id
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }
    res.json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /modules
const createModule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { action, ...moduleData } = req.body;

    if (action === 'submit') {
      moduleData.status = 'Submitted';
      moduleData.publishDate = new Date();
    } else {
      moduleData.status = 'Draft';
    }

    const module = await Module.create(moduleData);
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /modules/:id
const updateModule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /modules/review-queue
const getReviewQueue = async (req, res) => {
  try {
    const { status, program, search, role = 'user' } = req.query;
    const filter = {};

    const statusMap = role === 'admin'
      ? {
          pending: submittedStatuses,
          approved: ['Approved'],
          rejected: ['Rejected'],
        }
      : {
          submitted: submittedStatuses,
          needsChanges: ['Needs Changes'],
          approved: ['Approved'],
        };
    const defaultStatuses = role === 'admin'
      ? [...submittedStatuses, 'Approved', 'Rejected']
      : [...submittedStatuses, 'Needs Changes', 'Approved'];

    if (status) {
      filter.status = { $in: statusMap[status] || defaultStatuses };
    } else {
      filter.status = { $in: defaultStatuses };
    }

    if (program) filter.program = program;
    if (search) {
      filter.$or = [
        { moduleName: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const modules = await Module.find(filter).sort({ createdAt: -1 });

    const submittedCount = await Module.countDocuments({ status: { $in: submittedStatuses } });
    const pendingCount = submittedCount;
    const needsChangesCount = await Module.countDocuments({ status: 'Needs Changes' });
    const approvedCount = await Module.countDocuments({ status: 'Approved' });
    const rejectedCount = await Module.countDocuments({ status: 'Rejected' });

    res.json({
      success: true,
      data: modules,
      meta: {
        submittedCount,
        pendingCount,
        needsChangesCount,
        approvedCount,
        rejectedCount,
        totalUnderReview: submittedCount + needsChangesCount + approvedCount,
        totalAwaitingReview: pendingCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getModules, getModuleById, createModule, updateModule, getReviewQueue };
