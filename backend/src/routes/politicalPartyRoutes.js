/**
 * Political Party Routes
 * Nepal Election Portal
 * 
 * PUBLIC ROUTES:
 * GET  /api/parties      - Get all published
 * GET  /api/parties/:id  - Get single published
 * 
 * ADMIN ROUTES:
 * GET    /api/admin/parties          - Get all
 * POST   /api/admin/parties          - Create
 * PUT    /api/admin/parties/:id      - Update
 * DELETE /api/admin/parties/:id      - Delete
 * PATCH  /api/admin/parties/:id/publish - Toggle publish
 */

const express = require('express');
const router = express.Router();
const { politicalPartyController } = require('../controllers');
const { protect } = require('../middleware');

// ============ PUBLIC ROUTES ============
router.get('/', politicalPartyController.getAll);
router.get('/:id', politicalPartyController.getById);

module.exports = router;

// ============ ADMIN ROUTES ============
const adminRouter = express.Router();

adminRouter.get('/', protect, politicalPartyController.adminGetAll);
adminRouter.post('/', protect, politicalPartyController.create);
adminRouter.put('/:id', protect, politicalPartyController.update);
adminRouter.delete('/:id', protect, politicalPartyController.remove);
adminRouter.patch('/:id/publish', protect, politicalPartyController.togglePublish);

module.exports.adminRouter = adminRouter;
