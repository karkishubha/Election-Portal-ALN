/**
 * Results Routes
 * Endpoints for election results data
 */

const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

// GET /api/results/pr - Proportional Representation results with seat allocation
router.get('/pr', resultsController.getPRResults);

// GET /api/results/fptp - First Past The Post results
router.get('/fptp', resultsController.getFPTPResults);

// GET /api/results/fptp/filter - Filtered FPTP results by state/district/constituency
router.get('/fptp/filter', resultsController.getFilteredFPTPResults);

// GET /api/results/summary - Combined results summary
router.get('/summary', resultsController.getResultsSummary);

// GET /api/results/slider - Random constituency data for homepage slider
router.get('/slider', resultsController.getSliderData);

// GET /api/results/map - FPTP results for map visualization
router.get('/map', resultsController.getMapData);

// GET /api/results/states - List of states/provinces
router.get('/states', resultsController.getStates);

// GET /api/results/districts - List of districts (optionally by state)
router.get('/districts', resultsController.getDistricts);

// GET /api/results/constituencies - List of constituencies (optionally by state/district)
router.get('/constituencies', resultsController.getConstituencies);

module.exports = router;
