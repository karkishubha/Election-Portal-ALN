/**
 * Election Integrity Routes
 * Nepal Election Portal
 * 
 * PUBLIC ROUTES:
 * GET  /api/election-integrity            - Get all published
 * GET  /api/election-integrity/categories - Get category list
 * GET  /api/election-integrity/:id        - Get single published
 * 
 * ADMIN ROUTES:
 * GET    /api/admin/election-integrity          - Get all
 * POST   /api/admin/election-integrity          - Create
 * PUT    /api/admin/election-integrity/:id      - Update
 * DELETE /api/admin/election-integrity/:id      - Delete
 * PATCH  /api/admin/election-integrity/:id/publish - Toggle publish
 */

const express = require('express');
const router = express.Router();
const { electionIntegrityController } = require('../controllers');
const { protect } = require('../middleware');

// ============ PUBLIC ROUTES ============
router.get('/categories', electionIntegrityController.getCategories);
router.get('/', electionIntegrityController.getAll);
router.get('/:id', electionIntegrityController.getById);

module.exports = router;

// ============ ADMIN ROUTES ============
const adminRouter = express.Router();

adminRouter.get('/', protect, electionIntegrityController.adminGetAll);
adminRouter.post('/', protect, electionIntegrityController.create);
adminRouter.put('/:id', protect, electionIntegrityController.update);
adminRouter.delete('/:id', protect, electionIntegrityController.remove);
adminRouter.patch('/:id/publish', protect, electionIntegrityController.togglePublish);

module.exports.adminRouter = adminRouter;
