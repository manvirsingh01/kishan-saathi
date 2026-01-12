const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Reports routes - Disabled for serverless mode
// Original functionality required database models that aren't compatible with serverless

// @route   POST /api/reports/loss
// @desc    Create a new climate loss report
// @access  Private
router.post('/loss', authMiddleware, async (req, res) => {
    res.status(503).json({
        error: 'Report creation is temporarily unavailable in serverless mode',
        message: 'Please use the local version for full report functionality'
    });
});

// @route   GET /api/reports/loss
// @desc    Get all loss reports for farmer
// @access  Private
router.get('/loss', authMiddleware, async (req, res) => {
    res.json({ reports: [] });
});

// @route   GET /api/reports/loss/:id
// @desc    Get specific loss report
// @access  Private
router.get('/loss/:id', authMiddleware, async (req, res) => {
    res.status(404).json({ error: 'Report not found' });
});

// @route   PUT /api/reports/loss/:id
// @desc    Update loss report
// @access  Private
router.put('/loss/:id', authMiddleware, async (req, res) => {
    res.status(404).json({ error: 'Report not found' });
});

// @route   GET /api/reports/pdf/:id
// @desc    Generate and download PDF report
// @access  Private
router.get('/pdf/:id', authMiddleware, async (req, res) => {
    res.status(503).json({ error: 'PDF generation unavailable in serverless mode' });
});

module.exports = router;
