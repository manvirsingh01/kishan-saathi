const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'soil-reports');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// In-memory storage for soil reports (local development)
let soilReportsCache = [];

// Generate unique ID
function generateId() {
    return 'sr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// @route   POST /api/soil-reports/upload
// @desc    Upload soil report PDF and get AI recommendations
// @access  Private
router.post('/upload', authMiddleware, async (req, res) => {
    try {
        // Check if we're in local development mode
        if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_FILE_UPLOADS) {
            return res.status(503).json({
                error: 'Soil report upload unavailable in serverless mode',
                message: 'File uploads require persistent storage. Please use the local version.'
            });
        }

        // For local development, create a mock analysis response
        const reportId = generateId();
        const now = new Date().toISOString();

        // Mock soil analysis (in production, this would parse the PDF)
        const mockReport = {
            reportId,
            userId: req.user.id,
            uploadedAt: now,
            soilAnalysis: {
                pH: 7.2,
                nitrogen: 'Medium (280 kg/ha)',
                phosphorus: 'Low (12 kg/ha)',
                potassium: 'High (320 kg/ha)',
                organicCarbon: '0.65%',
                texture: 'Sandy Loam'
            },
            cropRecommendations: [
                {
                    rank: 1,
                    cropName: { english: 'Wheat', hindi: 'गेहूं' },
                    suitability: 'highly suitable',
                    reason: 'Ideal pH and good potassium levels for wheat cultivation',
                    season: 'Rabi (Nov-March)',
                    expectedYield: { min: 35, max: 45, unit: 'quintals/hectare' },
                    waterRequirement: 'Moderate (400-500mm)',
                    marketPrice: { msp: 2275, unit: 'per quintal' },
                    duration: { days: 120, description: '120-150 days' },
                    benefits: ['High market demand', 'Good storage life', 'Government MSP support']
                },
                {
                    rank: 2,
                    cropName: { english: 'Mustard', hindi: 'सरसों' },
                    suitability: 'suitable',
                    reason: 'Sandy loam soil is good for mustard, low water requirement',
                    season: 'Rabi (Oct-Feb)',
                    expectedYield: { min: 12, max: 18, unit: 'quintals/hectare' },
                    waterRequirement: 'Low (250-400mm)',
                    marketPrice: { msp: 5650, unit: 'per quintal' },
                    duration: { days: 130, description: '130-150 days' },
                    benefits: ['Oil extraction potential', 'Nitrogen fixation', 'Low input cost']
                },
                {
                    rank: 3,
                    cropName: { english: 'Chickpea', hindi: 'चना' },
                    suitability: 'suitable',
                    reason: 'Good for nitrogen-fixing, suitable pH range',
                    season: 'Rabi (Oct-Nov)',
                    expectedYield: { min: 15, max: 20, unit: 'quintals/hectare' },
                    waterRequirement: 'Low (300-400mm)',
                    marketPrice: { msp: 5440, unit: 'per quintal' },
                    duration: { days: 100, description: '100-120 days' },
                    benefits: ['Pulse crop for rotation', 'High protein content', 'Improves soil health']
                }
            ],
            fertilizerPlan: {
                organic: [
                    'FYM (Farm Yard Manure): 10-12 tonnes/hectare before sowing',
                    'Vermicompost: 2-3 tonnes/hectare',
                    'Green manuring with Sesbania before wheat'
                ],
                chemical: [
                    { name: 'Urea', quantity: '120 kg/ha', timing: 'Split: 50% basal, 25% at tillering, 25% at flowering' },
                    { name: 'DAP', quantity: '60 kg/ha', timing: 'At sowing' },
                    { name: 'MOP', quantity: '40 kg/ha', timing: 'At sowing (reduce due to high K in soil)' }
                ]
            },
            soilImprovement: [
                'Add phosphorus-rich fertilizers to address low P levels',
                'Maintain organic carbon by adding FYM or compost',
                'Consider green manuring to improve nitrogen levels',
                'Practice crop rotation with legumes to naturally fix nitrogen'
            ]
        };

        // Store in cache
        soilReportsCache.push(mockReport);

        res.json({
            message: 'Soil report analyzed successfully',
            report: mockReport
        });

    } catch (error) {
        console.error('Soil report upload error:', error);
        res.status(500).json({
            error: 'Failed to analyze soil report',
            message: error.message
        });
    }
});

// @route   GET /api/soil-reports
// @desc    Get all soil reports for logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    const userReports = soilReportsCache.filter(r => r.userId === req.user.id);
    res.json({ reports: userReports });
});

// @route   GET /api/soil-reports/:id
// @desc    Get specific soil report with full analysis
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    const report = soilReportsCache.find(r => r.reportId === req.params.id && r.userId === req.user.id);
    if (!report) {
        return res.status(404).json({ error: 'Soil report not found' });
    }
    res.json({ report });
});

// @route   DELETE /api/soil-reports/:id
// @desc    Delete soil report
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    const index = soilReportsCache.findIndex(r => r.reportId === req.params.id && r.userId === req.user.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Soil report not found' });
    }
    soilReportsCache.splice(index, 1);
    res.json({ message: 'Soil report deleted successfully' });
});

module.exports = router;
