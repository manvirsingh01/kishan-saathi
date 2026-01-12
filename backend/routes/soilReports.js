const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Soil Reports routes - Disabled for serverless mode
// File uploads and database storage require persistent storage not available on serverless

// @route   POST /api/soil-reports/upload
// @desc    Upload soil report PDF and get AI recommendations
// @access  Private
router.post('/upload', authMiddleware, async (req, res) => {
    res.status(503).json({
        error: 'Soil report upload unavailable in serverless mode',
        message: 'File uploads require persistent storage. Please use the local version.'
    });
});

// @route   GET /api/soil-reports
// @desc    Get all soil reports for logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    res.json({ reports: [] });
});

// @route   GET /api/soil-reports/:id
// @desc    Get specific soil report with full analysis
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    res.status(404).json({ error: 'Soil report not found' });
});

// @route   DELETE /api/soil-reports/:id
// @desc    Delete soil report
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    res.status(404).json({ error: 'Soil report not found' });
});

module.exports = router;
