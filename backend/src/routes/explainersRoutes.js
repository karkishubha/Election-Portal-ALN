/**
 * Explainers Routes
 */

const express = require('express');
const router = express.Router();
const { explainersController } = require('../controllers');
const { protect } = require('../middleware');

// Public
router.get('/', explainersController.getAll);
router.get('/:id', explainersController.getById);

module.exports = router;

// Admin
const adminRouter = express.Router();
adminRouter.get('/', protect, explainersController.adminGetAll);
adminRouter.post('/', protect, explainersController.create);
adminRouter.put('/:id', protect, explainersController.update);
adminRouter.delete('/:id', protect, explainersController.remove);
adminRouter.patch('/:id/publish', protect, explainersController.togglePublish);

module.exports.adminRouter = adminRouter;
