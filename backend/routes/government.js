const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const GovernmentInfo = require('../models/GovernmentInfo');

// @route   GET /api/government/info
// @desc    Get all government information (public/farmer access)
// @access  Private
router.get('/info', authMiddleware, async (req, res) => {
    try {
        const { category, state } = req.query;

        const filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        if (state) {
            filter.$or = [
                { 'details.targetStates': state },
                { 'details.targetStates': { $exists: false } },
                { 'details.targetStates': { $size: 0 } }
            ];
        }

        const governmentInfo = await GovernmentInfo.find(filter)
            .sort({ priority: -1, createdAt: -1 })
            .select('-__v');

        res.json({ data: governmentInfo });
    } catch (error) {
        console.error('Government info fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch government information' });
    }
});

// @route   GET /api/government/info/:id
// @desc    Get specific government information
// @access  Private
router.get('/info/:id', authMiddleware, async (req, res) => {
    try {
        const info = await GovernmentInfo.findById(req.params.id);

        if (!info) {
            return res.status(404).json({ error: 'Information not found' });
        }

        res.json({ data: info });
    } catch (error) {
        console.error('Government info detail fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch information details' });
    }
});

// @route   GET /api/government/categories
// @desc    Get all available categories
// @access  Private
router.get('/categories', authMiddleware, async (req, res) => {
    try {
        const categories = await GovernmentInfo.distinct('category', { isActive: true });
        res.json({ categories });
    } catch (error) {
        console.error('Categories fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// New Gemini AI-powered routes
const governmentInfoService = require('../services/governmentInfoService');

// @route   GET /api/government/ai/policies
// @desc    Get AI-generated government policies for user's region
// @access  Private
router.get('/ai/policies', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { state, district } = user.farmDetails.location;

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
// @desc    Get AI-generated crop prices for user's region
// @access  Private
router.get('/ai/prices', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { state, district } = user.farmDetails.location;

        const prices = await governmentInfoService.getCropPrices(state, district);
        res.json(prices);
    } catch (error) {
        console.error('AI Crop prices fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch crop prices',
            message: error.message
        });
    }
});

// @route   GET /api/government/ai/resources
// @desc    Get AI-generated agricultural resources for user's state
// @access  Private
router.get('/ai/resources', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { state } = user.farmDetails.location;

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
        const { state, district } = user.farmDetails.location;

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

// Admin Routes

// @route   POST /api/government/admin
// @desc    Create new government information (admin only)
// @access  Private (Admin)
router.post('/admin', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const governmentInfo = new GovernmentInfo({
            ...req.body,
            createdBy: req.user._id,
            lastModifiedBy: req.user._id
        });

        await governmentInfo.save();

        res.status(201).json({
            message: 'Government information created successfully',
            data: governmentInfo
        });
    } catch (error) {
        console.error('Government info creation error:', error);
        res.status(500).json({ error: 'Failed to create government information' });
    }
});

// @route   PUT /api/government/admin/:id
// @desc    Update government information (admin only)
// @access  Private (Admin)
router.put('/admin/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const governmentInfo = await GovernmentInfo.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                lastModifiedBy: req.user._id,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!governmentInfo) {
            return res.status(404).json({ error: 'Information not found' });
        }

        res.json({
            message: 'Government information updated successfully',
            data: governmentInfo
        });
    } catch (error) {
        console.error('Government info update error:', error);
        res.status(500).json({ error: 'Failed to update government information' });
    }
});

// @route   DELETE /api/government/admin/:id
// @desc    Delete government information (admin only)
// @access  Private (Admin)
router.delete('/admin/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const governmentInfo = await GovernmentInfo.findByIdAndDelete(req.params.id);

        if (!governmentInfo) {
            return res.status(404).json({ error: 'Information not found' });
        }

        res.json({ message: 'Government information deleted successfully' });
    } catch (error) {
        console.error('Government info deletion error:', error);
        res.status(500).json({ error: 'Failed to delete government information' });
    }
});

// @route   GET /api/government/admin/all
// @desc    Get all government information including inactive (admin only)
// @access  Private (Admin)
router.get('/admin/all', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const governmentInfo = await GovernmentInfo.find()
            .sort({ priority: -1, createdAt: -1 })
            .populate('createdBy', 'name email')
            .populate('lastModifiedBy', 'name email');

        res.json({ data: governmentInfo });
    } catch (error) {
        console.error('Government info admin fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch government information' });
    }
});

module.exports = router;
