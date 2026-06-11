const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const moduleSchema = new mongoose.Schema(
  {
    moduleName: {
      type: String,
      required: [true, 'Module name is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    program: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    targetGroup: {
      type: String,
      trim: true,
    },
    serviceComponent: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      maxlength: [100, 'Summary cannot exceed 100 characters'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Pending Review', 'Active', 'Needs Changes', 'Approved', 'Rejected'],
      default: 'Draft',
    },
    reviewStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', null],
      default: null,
    },
    notes: {
      type: [noteSchema],
      default: [],
    },
    publishDate: {
      type: Date,
    },
    collaborators: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for search and filtering
moduleSchema.index({ moduleName: 'text', summary: 'text' });
moduleSchema.index({ status: 1 });
moduleSchema.index({ category: 1 });
moduleSchema.index({ tags: 1 });
moduleSchema.index({ author: 1 });

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
