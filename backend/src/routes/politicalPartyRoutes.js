/**
 * Political Party Routes
 * Nepal Election Portal
 * 
 * PUBLIC ROUTES:
 * GET  /api/parties      - Get all published
 * GET  /api/parties/:id  - Get single published
 * GET  /api/parties/:id/manifesto - Get manifesto PDF
 * 
 * ADMIN ROUTES:
 * GET    /api/admin/parties          - Get all
 * POST   /api/admin/parties          - Create
 * PUT    /api/admin/parties/:id      - Update
 * DELETE /api/admin/parties/:id      - Delete
 * PATCH  /api/admin/parties/:id/publish - Toggle publish
 * POST   /api/admin/parties/:id/manifesto - Upload manifesto PDF
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { politicalPartyController } = require('../controllers');
const { protect } = require('../middleware');

// Configure multer for memory storage (to store in database)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// ============ PUBLIC ROUTES ============
router.get('/', politicalPartyController.getAll);
router.get('/:id', politicalPartyController.getById);
router.get('/:id/manifesto', politicalPartyController.getManifesto);

module.exports = router;

// ============ ADMIN ROUTES ============
const adminRouter = express.Router();

adminRouter.get('/', protect, politicalPartyController.adminGetAll);
adminRouter.post('/', protect, politicalPartyController.create);
adminRouter.put('/:id', protect, politicalPartyController.update);
adminRouter.delete('/:id', protect, politicalPartyController.remove);
adminRouter.patch('/:id/publish', protect, politicalPartyController.togglePublish);
adminRouter.post('/:id/manifesto', protect, upload.single('file'), politicalPartyController.uploadManifesto);

module.exports.adminRouter = adminRouter;
