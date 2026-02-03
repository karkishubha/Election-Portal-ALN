/**
 * Violations Routes
 */

const express = require('express');
const router = express.Router();
const { violationsController } = require('../controllers');
const { protect } = require('../middleware');

// Public
router.get('/', violationsController.getAll);
router.get('/:id', violationsController.getById);

module.exports = router;

// Admin
const adminRouter = express.Router();
adminRouter.get('/', protect, violationsController.adminGetAll);
adminRouter.post('/', protect, violationsController.create);
adminRouter.put('/:id', protect, violationsController.update);
adminRouter.delete('/:id', protect, violationsController.remove);
adminRouter.patch('/:id/publish', protect, violationsController.togglePublish);

module.exports.adminRouter = adminRouter;
