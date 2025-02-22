const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer();

// Protected routes - require authentication
router.use(auth);

// CRUD operations
router.post('/projects/:projectId/planning', planningController.createPlanning);
router.get('/projects/:projectId/planning', planningController.getAllPlannings);
router.get('/projects/:projectId/planning/:id', planningController.getPlanning);
router.put('/projects/:projectId/planning/:id', planningController.updatePlanning);
router.delete('/projects/:projectId/planning/:id', planningController.deletePlanning);

// Spreadsheet operations
router.post('/projects/:projectId/planning/import', 
  upload.single('file'), 
  planningController.importFromSpreadsheet
);
router.get('/projects/:projectId/planning/:id/export', 
  planningController.exportToSpreadsheet
);

// Optimization operations
router.get('/projects/:projectId/planning/:id/optimize', 
  planningController.getOptimizedSchedule
);

module.exports = router; 