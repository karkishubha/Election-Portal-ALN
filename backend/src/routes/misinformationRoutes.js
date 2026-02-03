/**
 * Misinformation Routes
 */

const express = require('express');
const router = express.Router();
const { misinformationController } = require('../controllers');
const { protect } = require('../middleware');

// Public
router.get('/', misinformationController.getAll);
router.get('/:id', misinformationController.getById);

module.exports = router;

// Admin
const adminRouter = express.Router();
adminRouter.get('/', protect, misinformationController.adminGetAll);
adminRouter.post('/', protect, misinformationController.create);
adminRouter.put('/:id', protect, misinformationController.update);
adminRouter.delete('/:id', protect, misinformationController.remove);
adminRouter.patch('/:id/publish', protect, misinformationController.togglePublish);

module.exports.adminRouter = adminRouter;
