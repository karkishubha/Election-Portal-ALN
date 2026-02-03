/**
 * Official Announcements Routes
 */

const express = require('express');
const router = express.Router();
const { officialAnnouncementsController } = require('../controllers');
const { protect } = require('../middleware');

// Public
router.get('/', officialAnnouncementsController.getAll);
router.get('/:id', officialAnnouncementsController.getById);

module.exports = router;

// Admin
const adminRouter = express.Router();
adminRouter.get('/', protect, officialAnnouncementsController.adminGetAll);
adminRouter.post('/', protect, officialAnnouncementsController.create);
adminRouter.put('/:id', protect, officialAnnouncementsController.update);
adminRouter.delete('/:id', protect, officialAnnouncementsController.remove);
adminRouter.patch('/:id/publish', protect, officialAnnouncementsController.togglePublish);

module.exports.adminRouter = adminRouter;
