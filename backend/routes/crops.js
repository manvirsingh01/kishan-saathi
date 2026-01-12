const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
// CropRecommendation model disabled for serverless compatibility
// const CropRecommendation = require('../models/CropRecommendation');
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

        // Database save disabled for serverless compatibility
        // await CropRecommendation.create({
        //     userId: user.id,
        //     inputParams: params,
        //     recommendations: aiResult.recommendations,
        //     aiModel: aiResult.aiModel,
        //     season: params.season
        // });

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
        // Database disabled for serverless - return empty history
        res.json({ history: [] });
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
        // Database disabled for serverless
        res.status(404).json({ error: 'Recommendation history not available in serverless mode' });
    } catch (error) {
        console.error('Recommendation fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation' });
    }
});

module.exports = router;
