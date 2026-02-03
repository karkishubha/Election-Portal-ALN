/**
 * Infographics Routes
 */

const express = require('express');
const router = express.Router();
const { infographicsController } = require('../controllers');
const { protect } = require('../middleware');

// Public
router.get('/', infographicsController.getAll);
router.get('/:id', infographicsController.getById);

module.exports = router;

// Admin
const adminRouter = express.Router();
adminRouter.get('/', protect, infographicsController.adminGetAll);
adminRouter.post('/', protect, infographicsController.create);
adminRouter.put('/:id', protect, infographicsController.update);
adminRouter.delete('/:id', protect, infographicsController.remove);
adminRouter.patch('/:id/publish', protect, infographicsController.togglePublish);

module.exports.adminRouter = adminRouter;
