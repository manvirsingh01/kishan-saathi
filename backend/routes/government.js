const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const governmentInfoService = require('../services/governmentInfoService');

// Government Information Routes - Uses AI service (no database required)

// @route   GET /api/government/info
// @desc    Get all government information
// @access  Private
router.get('/info', authMiddleware, async (req, res) => {
    res.json({
        data: [],
        message: 'Database-stored information unavailable. Use /ai/comprehensive for AI-generated info.'
    });
});

// @route   GET /api/government/info/:id
// @desc    Get specific government information by ID
// @access  Private
router.get('/info/:id', authMiddleware, async (req, res) => {
    res.status(404).json({ error: 'Information not found' });
});

// @route   GET /api/government/categories
// @desc    Get list of available categories
// @access  Private
router.get('/categories', authMiddleware, async (req, res) => {
    res.json({
        categories: ['schemes', 'subsidies', 'loan', 'insurance', 'msp', 'advisory']
    });
});

// AI-powered routes (these work without database)

// @route   GET /api/government/ai/policies
// @desc    Get government policies using AI
// @access  Private
router.get('/ai/policies', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const activeFarm = user.farmDetails || user.farms?.[0];

        const state = activeFarm?.location?.state || req.query.state || 'Rajasthan';
        const district = activeFarm?.location?.district || req.query.district || 'Jodhpur';

        const policies = await governmentInfoService.getGovernmentPolicies(state, district);
        res.json(policies);
    } catch (error) {
        console.error('AI Policies fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch policies',
            message: error.message
        });
    }
});

// @route   GET /api/government/ai/prices
// @desc    Get crop prices using AI
// @access  Private
router.get('/ai/prices', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const activeFarm = user.farmDetails || user.farms?.[0];

        const state = activeFarm?.location?.state || req.query.state || 'Rajasthan';
        const district = activeFarm?.location?.district || req.query.district || 'Jodhpur';

        const prices = await governmentInfoService.getCropPrices(state, district);
        res.json(prices);
    } catch (error) {
        console.error('AI Prices fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch prices',
            message: error.message
        });
    }
});

// @route   GET /api/government/ai/resources
// @desc    Get agricultural resources using AI
// @access  Private
router.get('/ai/resources', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const activeFarm = user.farmDetails || user.farms?.[0];
        const state = activeFarm?.location?.state || req.query.state || 'Rajasthan';

        const resources = await governmentInfoService.getAgriculturalResources(state);
        res.json(resources);
    } catch (error) {
        console.error('AI Resources fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch resources',
            message: error.message
        });
    }
});

// @route   GET /api/government/ai/comprehensive
// @desc    Get comprehensive government information using AI
// @access  Private
router.get('/ai/comprehensive', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const activeFarm = user.farmDetails || user.farms?.[0];

        if (!activeFarm || !activeFarm.location) {
            return res.status(400).json({
                error: 'No farm location found. Please add a farm with location details.'
            });
        }

        const state = activeFarm.location.state || 'Rajasthan';
        const district = activeFarm.location.district || 'Jodhpur';

        console.log(`Fetching government info for: ${state}, ${district}`);

        const info = await governmentInfoService.getComprehensiveGovernmentInfo(state, district);
        res.json(info);
    } catch (error) {
        console.error('AI Comprehensive info fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch comprehensive information',
            message: error.message
        });
    }
});

// Admin Routes - Disabled in serverless mode

// @route   POST /api/government/admin
router.post('/admin', authMiddleware, adminMiddleware, async (req, res) => {
    res.status(503).json({ error: 'Admin operations unavailable in serverless mode' });
});

// @route   PUT /api/government/admin/:id
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
    res.status(503).json({ error: 'Admin operations unavailable in serverless mode' });
});

// @route   DELETE /api/government/admin/:id
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
    res.status(503).json({ error: 'Admin operations unavailable in serverless mode' });
});

// @route   GET /api/government/admin
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
    res.json({ data: [] });
});

module.exports = router;
