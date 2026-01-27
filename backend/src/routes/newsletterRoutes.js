/**
 * Newsletter Routes
 * Nepal Election Portal
 * 
 * PUBLIC ROUTES:
 * GET  /api/newsletters      - Get all published
 * GET  /api/newsletters/:id  - Get single published
 * 
 * ADMIN ROUTES:
 * GET    /api/admin/newsletters          - Get all
 * POST   /api/admin/newsletters          - Create
 * PUT    /api/admin/newsletters/:id      - Update
 * DELETE /api/admin/newsletters/:id      - Delete
 * PATCH  /api/admin/newsletters/:id/publish - Toggle publish
 */

const express = require('express');
const router = express.Router();
const { newsletterController } = require('../controllers');
const { protect } = require('../middleware');

// ============ PUBLIC ROUTES ============
router.get('/', newsletterController.getAll);
router.get('/:id', newsletterController.getById);

module.exports = router;

// ============ ADMIN ROUTES ============
const adminRouter = express.Router();

adminRouter.get('/', protect, newsletterController.adminGetAll);
adminRouter.post('/', protect, newsletterController.create);
adminRouter.put('/:id', protect, newsletterController.update);
adminRouter.delete('/:id', protect, newsletterController.remove);
adminRouter.patch('/:id/publish', protect, newsletterController.togglePublish);

module.exports.adminRouter = adminRouter;
