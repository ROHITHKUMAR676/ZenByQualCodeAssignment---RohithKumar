const express = require('express');
const router = express.Router();
const {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  getReviewQueue,
} = require('../controllers/moduleController');
const { validateCreateModule, validateUpdateModule } = require('../middleware/validation');

// Review queue - must be before /:id to avoid conflict
router.get('/review-queue', getReviewQueue);

router.get('/', getModules);
router.get('/:id', getModuleById);
router.post('/', validateCreateModule, createModule);
router.put('/:id', validateUpdateModule, updateModule);

module.exports = router;
