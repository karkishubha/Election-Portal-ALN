/**
 * Voter Education Routes
 * Nepal Election Portal
 * 
 * PUBLIC ROUTES:
 * GET  /api/voter-education      - Get all published resources
 * GET  /api/voter-education/:id  - Get single published resource
 * 
 * ADMIN ROUTES:
 * GET    /api/admin/voter-education          - Get all (including unpublished)
 * POST   /api/admin/voter-education          - Create resource
 * PUT    /api/admin/voter-education/:id      - Update resource
 * DELETE /api/admin/voter-education/:id      - Delete resource
 * PATCH  /api/admin/voter-education/:id/publish - Toggle publish
 */

const express = require('express');
const router = express.Router();
const { voterEducationController } = require('../controllers');
const { protect } = require('../middleware');

// ============ PUBLIC ROUTES ============
router.get('/', voterEducationController.getAll);
router.get('/:id', voterEducationController.getById);

module.exports = router;

// ============ ADMIN ROUTES (exported separately) ============
const adminRouter = express.Router();

adminRouter.get('/', protect, voterEducationController.adminGetAll);
adminRouter.post('/', protect, voterEducationController.create);
adminRouter.put('/:id', protect, voterEducationController.update);
adminRouter.delete('/:id', protect, voterEducationController.remove);
adminRouter.patch('/:id/publish', protect, voterEducationController.togglePublish);

module.exports.adminRouter = adminRouter;
