const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer();

// Protected routes - require authentication
router.use(auth);

// CRUD operations
router.post('/', workflowController.createWorkflow);
router.get('/', workflowController.getWorkflows);
router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

// Spreadsheet operations
router.post('/import', upload.single('file'), workflowController.importFromSpreadsheet);
router.get('/:id/export', workflowController.exportToSpreadsheet);

// LLM operations
router.get('/:id/suggestions', workflowController.getLLMSuggestions);

module.exports = router; 