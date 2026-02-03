/**
 * Videos Routes
 */

const express = require('express');
const router = express.Router();
const { videosController } = require('../controllers');
const { protect } = require('../middleware');

// Public
router.get('/', videosController.getAll);
router.get('/:id', videosController.getById);

module.exports = router;

// Admin
const adminRouter = express.Router();
adminRouter.get('/', protect, videosController.adminGetAll);
adminRouter.post('/', protect, videosController.create);
adminRouter.put('/:id', protect, videosController.update);
adminRouter.delete('/:id', protect, videosController.remove);
adminRouter.patch('/:id/publish', protect, videosController.togglePublish);

module.exports.adminRouter = adminRouter;
