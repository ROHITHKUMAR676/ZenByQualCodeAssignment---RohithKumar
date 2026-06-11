const { body } = require('express-validator');

const validateCreateModule = [
  body('moduleName')
    .notEmpty()
    .withMessage('Module name is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Module name must be between 2 and 200 characters'),
  body('author').notEmpty().withMessage('Author is required').trim(),
  body('summary')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Summary cannot exceed 100 characters'),
  body('status')
    .optional()
    .isIn(['Draft', 'Submitted', 'Pending Review', 'Active', 'Needs Changes', 'Approved', 'Rejected'])
    .withMessage('Invalid status value'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

const validateUpdateModule = [
  body('moduleName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Module name must be between 2 and 200 characters'),
  body('summary')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Summary cannot exceed 100 characters'),
  body('status')
    .optional()
    .isIn(['Draft', 'Submitted', 'Pending Review', 'Active', 'Needs Changes', 'Approved', 'Rejected'])
    .withMessage('Invalid status value'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

module.exports = { validateCreateModule, validateUpdateModule };
