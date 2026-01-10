const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gemini AI Service for Crop Recommendations
 */

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate crop recommendations using Gemini
async function generateCropRecommendations(params) {
    try {
        const { soilType, season, rainfall, temperature, landArea, waterAvailability, climateStress, location } = params;

        // Create detailed prompt for Gemini
        const prompt = `You are an expert agricultural advisor for Indian farmers. Provide climate-resilient crop recommendations.

**Farmer's Context:**
- Location: ${location.district}, ${location.state}
- Soil Type: ${soilType}
- Season: ${season}
- Land Area: ${landArea} hectares
- Expected Rainfall: ${rainfall}mm
- Temperature: ${temperature}°C
- Water Availability: ${waterAvailability}
- Climate Stress Factors:
  * Heat Stress: ${climateStress.heat}
  * Drought Risk: ${climateStress.drought}
  * Flood Risk: ${climateStress.flood}

**Task:**
Recommend the TOP 5 most suitable crops for these conditions, prioritizing climate resilience.

**Response Format (JSON):**
{
  "recommendations": [
    {
      "cropName": {"english": "Crop Name", "hindi": "फसल का नाम"},
      "rank": 1,
      "climateResilience": {
        "score": 85,
        "level": "very-high"
      },
      "yieldExpectation": {
        "min": 25,
        "max": 35,
        "unit": "quintals/hectare"
      },
      "waterRequirement": "medium",
      "duration": {
        "days": 120,
        "description": "4 months"
      },
      "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "considerations": ["Point 1", "Point 2"],
      "marketPrice": {
        "msp": 2200,
        "current": 2400,
        "trend": "stable"
      }
    }
  ]
}

**Important:**
1. Consider the climate stress factors heavily
2. Prioritize drought/heat-resistant crops if stress is high
3. Include both traditional and modern climate-resilient varieties
4. Provide realistic yield expectations for the region
5. Include local market prices (MSP in INR per quintal)
6. Return ONLY valid JSON, no additional text`;

        // Call Gemini API
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        // Remove markdown code blocks if present
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const recommendations = JSON.parse(jsonText);

        return {
            recommendations: recommendations.recommendations || [],
            aiModel: {
                provider: 'Gemini',
                modelVersion: 'gemini-pro',
                confidence: 85
            }
        };
    } catch (error) {
        console.error('Gemini AI crop recommendation error:', error.message);

        // Fallback to rule-based recommendations if AI fails
        return getFallbackRecommendations(params);
    }
}

// Fallback rule-based recommendations
function getFallbackRecommendations(params) {
    const { soilType, season, climateStress } = params;

    // Simple rule-based recommendations
    const cropDatabase = {
        kharif: {
            alluvial: ['Rice', 'Maize', 'Sugarcane'],
            black: ['Cotton', 'Soybean', 'Jowar'],
            red: ['Groundnut', 'Millets', 'Cotton'],
            laterite: ['Rice', 'Ragi', 'Cashew']
        },
        rabi: {
            alluvial: ['Wheat', 'Mustard', 'Peas'],
            black: ['Wheat', 'Gram', 'Linseed'],
            red: ['Groundnut', 'Tobacco', 'Millets'],
            laterite: ['Rice', 'Vegetables', 'Pulses']
        }
    };

    const crops = cropDatabase[season]?.[soilType] || ['Rice', 'Wheat', 'Maize'];

    const recommendations = crops.slice(0, 5).map((crop, index) => ({
        cropName: {
            english: crop,
            hindi: crop
        },
        rank: index + 1,
        climateResilience: {
            score: 70 - (index * 5),
            level: 'medium'
        },
        yieldExpectation: {
            min: 20,
            max: 30,
            unit: 'quintals/hectare'
        },
        waterRequirement: 'medium',
        duration: {
            days: 120,
            description: '3-4 months'
        },
        benefits: ['Suitable for local climate', 'Market demand available'],
        considerations: ['Monitor weather conditions', 'Ensure adequate irrigation'],
        marketPrice: {
            msp: 2000,
            current: 2100,
            trend: 'stable'
        }
    }));

    return {
        recommendations,
        aiModel: {
            provider: 'Rule-based (Fallback)',
            modelVersion: 'v1',
            confidence: 60
        }
    };
}

module.exports = {
    generateCropRecommendations
};
