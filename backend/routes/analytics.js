const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const ClimateData = require('../models/ClimateData');
const LossReport = require('../models/LossReport');

// @route   GET /api/analytics/climate
// @desc    Get climate stress trends and historical graphs
// @access  Private
router.get('/climate', authMiddleware, async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Fetch historical climate data
        const climateHistory = await ClimateData.find({
            userId: req.user._id,
            calculatedAt: { $gte: startDate }
        })
            .sort({ calculatedAt: 1 })
            .select('stressIndicators riskAssessment calculatedAt season');

        // Process data for charts
        const trends = {
            heatStress: [],
            soilMoisture: [],
            rainfallIrregularity: [],
            floodRisk: [],
            droughtRisk: [],
            dates: []
        };

        climateHistory.forEach(data => {
            const date = new Date(data.calculatedAt).toLocaleDateString('en-IN');
            trends.dates.push(date);
            trends.heatStress.push(data.stressIndicators.heatStressIndex.value || 0);
            trends.soilMoisture.push(data.stressIndicators.soilMoistureStress.value || 0);
            trends.rainfallIrregularity.push(data.stressIndicators.rainfallIrregularity.value || 0);
            trends.floodRisk.push(data.riskAssessment.floodRisk.probability || 0);
            trends.droughtRisk.push(data.riskAssessment.droughtRisk.probability || 0);
        });

        // Calculate averages
        const calculateAvg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;

        const averages = {
            heatStress: calculateAvg(trends.heatStress),
            soilMoisture: calculateAvg(trends.soilMoisture),
            rainfallIrregularity: calculateAvg(trends.rainfallIrregularity),
            floodRisk: calculateAvg(trends.floodRisk),
            droughtRisk: calculateAvg(trends.droughtRisk)
        };

        res.json({
            trends,
            averages,
            dataPoints: climateHistory.length,
            period: { days: parseInt(days), startDate, endDate: new Date() }
        });
    } catch (error) {
        console.error('Climate analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch climate analytics' });
    }
});

// @route   GET /api/analytics/yield
// @desc    Get yield loss estimation and trends
// @access  Private
router.get('/yield', authMiddleware, async (req, res) => {
    try {
        // Fetch all loss reports for the farmer
        const lossReports = await LossReport.find({ userId: req.user._id })
            .sort({ 'period.startDate': 1 })
            .select('period yieldLoss financialLoss createdAt');

        // Calculate trends
        const yieldTrends = {
            dates: [],
            expectedYield: [],
            actualYield: [],
            lossPercentage: [],
            financialLoss: []
        };

        let totalLoss = 0;
        let totalFinancialLoss = 0;

        lossReports.forEach(report => {
            const date = new Date(report.period.startDate).toLocaleDateString('en-IN');
            yieldTrends.dates.push(`${report.period.season || ''} ${date.split('/')[2] || ''}`);
            yieldTrends.expectedYield.push(report.yieldLoss.expectedYield.value || 0);
            yieldTrends.actualYield.push(report.yieldLoss.actualYield.value || 0);
            yieldTrends.lossPercentage.push(report.yieldLoss.lossPercentage || 0);
            yieldTrends.financialLoss.push(report.financialLoss.totalLoss || 0);

            totalLoss += report.yieldLoss.lossPercentage || 0;
            totalFinancialLoss += report.financialLoss.totalLoss || 0;
        });

        const avgLossPercentage = lossReports.length ? (totalLoss / lossReports.length).toFixed(2) : 0;

        // Price estimation for invisible losses
        const invisibleLossValue = totalFinancialLoss;

        res.json({
            yieldTrends,
            summary: {
                totalReports: lossReports.length,
                averageLossPercentage: avgLossPercentage,
                totalFinancialLoss,
                invisibleLossValue,
                currency: 'INR'
            },
            reports: lossReports
        });
    } catch (error) {
        console.error('Yield analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch yield analytics' });
    }
});

// @route   GET /api/analytics/summary
// @desc    Get overall analytics summary
// @access  Private
router.get('/summary', authMiddleware, async (req, res) => {
    try {
        // Get counts
        const climateDataCount = await ClimateData.countDocuments({ userId: req.user._id });
        const lossReportCount = await LossReport.countDocuments({ userId: req.user._id });

        // Get latest climate data
        const latestClimate = await ClimateData.findOne({ userId: req.user._id })
            .sort({ calculatedAt: -1 })
            .select('stressIndicators riskAssessment calculatedAt');

        // Get total financial loss
        const lossReports = await LossReport.find({ userId: req.user._id })
            .select('financialLoss');

        const totalFinancialLoss = lossReports.reduce((sum, report) =>
            sum + (report.financialLoss.totalLoss || 0), 0
        );

        res.json({
            summary: {
                totalClimateAssessments: climateDataCount,
                totalLossReports: lossReportCount,
                totalFinancialLoss,
                currency: 'INR'
            },
            latestAssessment: latestClimate ? {
                date: latestClimate.calculatedAt,
                heatStress: latestClimate.stressIndicators.heatStressIndex.level,
                soilMoisture: latestClimate.stressIndicators.soilMoistureStress.level,
                floodRisk: latestClimate.riskAssessment.floodRisk.level,
                droughtRisk: latestClimate.riskAssessment.droughtRisk.level
            } : null
        });
    } catch (error) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
});

module.exports = router;
