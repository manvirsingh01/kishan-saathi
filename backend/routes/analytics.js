const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Analytics routes - Simplified for serverless mode
// Original functionality required database models that aren't compatible with serverless

// @route   GET /api/analytics/climate
// @desc    Get climate stress trends and historical graphs
// @access  Private
router.get('/climate', authMiddleware, async (req, res) => {
    // Return empty trends in serverless mode
    res.json({
        trends: {
            heatStress: [],
            soilMoisture: [],
            rainfallIrregularity: [],
            floodRisk: [],
            droughtRisk: [],
            dates: []
        },
        averages: {
            heatStress: 0,
            soilMoisture: 0,
            rainfallIrregularity: 0,
            floodRisk: 0,
            droughtRisk: 0
        },
        dataPoints: 0,
        period: { days: 30, startDate: new Date(), endDate: new Date() },
        message: 'Historical data unavailable in serverless mode'
    });
});

// @route   GET /api/analytics/yield
// @desc    Get yield loss estimation and trends
// @access  Private
router.get('/yield', authMiddleware, async (req, res) => {
    res.json({
        yieldTrends: {
            dates: [],
            expectedYield: [],
            actualYield: [],
            lossPercentage: [],
            financialLoss: []
        },
        summary: {
            totalReports: 0,
            averageLossPercentage: 0,
            totalFinancialLoss: 0,
            invisibleLossValue: 0,
            currency: 'INR'
        },
        reports: [],
        message: 'Historical data unavailable in serverless mode'
    });
});

// @route   GET /api/analytics/summary
// @desc    Get overall analytics summary
// @access  Private
router.get('/summary', authMiddleware, async (req, res) => {
    res.json({
        summary: {
            totalClimateAssessments: 0,
            totalLossReports: 0,
            totalFinancialLoss: 0,
            currency: 'INR'
        },
        latestAssessment: null,
        message: 'Analytics data unavailable in serverless mode'
    });
});

module.exports = router;
