const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const CropRecommendation = require('../models/CropRecommendation');
const cropAI = require('../services/cropAI');
const climateEngine = require('../services/climateEngine');
const weatherService = require('../services/weatherService');
const riskCalculator = require('../services/riskCalculator');

// @route   POST /api/crops/recommend
// @desc    Get AI-based crop recommendations
// @access  Private
router.post('/recommend', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { farmDetails } = user;

        // Get current weather and climate stress
        const [lon, lat] = farmDetails.location.coordinates;
        const weatherData = await weatherService.getWeatherData(lat, lon);
        const stressIndicators = climateEngine.calculateAllStressIndicators(weatherData, farmDetails);

        // Calculate risk assessment  
        const climateRisks = riskCalculator.calculateRiskAssessment(
            weatherData,
            farmDetails,
            stressIndicators
        );

        // Prepare parameters for AI
        const params = {
            soilType: farmDetails.soilType,
            season: req.body.season || stressIndicators.season,
            rainfall: weatherData.forecast.reduce((sum, day) => sum + (day.rainfall || 0), 0),
            temperature: weatherData.current.temp,
            landArea: farmDetails.landArea,
            waterAvailability: farmDetails.waterSource?.join(', ') || 'rainfed',
            climateStress: {
                heat: stressIndicators.heatStressIndex.level,
                drought: climateRisks.droughtRisk.level,
                flood: climateRisks.floodRisk.level
            },
            location: farmDetails.location
        };

        // Get AI recommendations
        const aiResult = await cropAI.generateCropRecommendations(params);

        // Save recommendations (using Sequelize)
        await CropRecommendation.create({
            userId: user.id,
            inputParams: params,
            recommendations: aiResult.recommendations,
            aiModel: aiResult.aiModel,
            season: params.season
        });

        res.json({
            recommendations: aiResult.recommendations,
            inputParams: params,
            aiModel: aiResult.aiModel,
            generatedAt: new Date()
        });
    } catch (error) {
        console.error('Crop recommendation error:', error);
        res.status(500).json({
            error: 'Failed to generate crop recommendations',
            message: error.message
        });
    }
});

// @route   GET /api/crops/history
// @desc    Get previous crop recommendations
// @access  Private
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const history = await CropRecommendation.findAll({
            where: {
                userId: req.user.id,
                isActive: true
            },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({ history });
    } catch (error) {
        console.error('Crop history fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation history' });
    }
});

// @route   GET /api/crops/recommendation/:id
// @desc    Get specific recommendation by ID
// @access  Private
router.get('/recommendation/:id', authMiddleware, async (req, res) => {
    try {
        const recommendation = await CropRecommendation.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!recommendation) {
            return res.status(404).json({ error: 'Recommendation not found' });
        }

        res.json({ recommendation });
    } catch (error) {
        console.error('Recommendation fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation' });
    }
});

module.exports = router;
