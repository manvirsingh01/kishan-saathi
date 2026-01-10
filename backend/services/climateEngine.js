/**
 * Climate Stress Detection Engine
 * Calculates Heat Stress, Soil Moisture Stress, and Rainfall Irregularity
 */

// Calculate Heat Stress Index (0-100 scale)
function calculateHeatStress(temp, maxTemp, season) {
    // Temperature thresholds based on crop sensitivity
    const thresholds = {
        kharif: { optimal: 30, moderate: 35, severe: 40, extreme: 45 },
        rabi: { optimal: 25, moderate: 30, severe: 35, extreme: 40 },
        summer: { optimal: 35, moderate: 38, severe: 42, extreme: 45 },
        zaid: { optimal: 32, moderate: 36, severe: 40, extreme: 44 }
    };

    const threshold = thresholds[season] || thresholds.kharif;

    let value = 0;
    let level = 'low';

    if (maxTemp >= threshold.extreme) {
        value = 100;
        level = 'extreme';
    } else if (maxTemp >= threshold.severe) {
        value = 80;
        level = 'high';
    } else if (maxTemp >= threshold.moderate) {
        value = 50;
        level = 'medium';
    } else if (maxTemp >= threshold.optimal) {
        value = 25;
        level = 'low';
    } else {
        value = 0;
        level = 'low';
    }

    return {
        value,
        level,
        temperature: temp,
        maxTemp,
        threshold: threshold.optimal
    };
}

// Calculate Soil Moisture Stress (0-100 scale)
function calculateSoilMoistureStress(humidity, rainfall, landType, season) {
    // Estimate soil moisture based on humidity and rainfall
    // This is a simplified model - real implementation would use soil sensors

    let moistureEstimate = 0;

    // Humidity contribution (40%)
    moistureEstimate += (humidity / 100) * 40;

    // Rainfall contribution (60%)
    // Assuming recent rainfall data
    const rainfallFactor = Math.min(rainfall / 50, 1); // 50mm as reference
    moistureEstimate += rainfallFactor * 60;

    // Adjust for land type
    const landTypeMultiplier = {
        irrigated: 1.2,
        rainfed: 0.8,
        mixed: 1.0
    };
    moistureEstimate *= (landTypeMultiplier[landType] || 1.0);

    // Calculate stress (inverse of moisture)
    const stressValue = Math.max(0, 100 - moistureEstimate);

    let level = 'adequate';
    if (stressValue >= 75) level = 'critical';
    else if (stressValue >= 50) level = 'severe';
    else if (stressValue >= 25) level = 'moderate';

    return {
        value: Math.round(stressValue),
        level,
        estimatedMoisture: Math.round(moistureEstimate)
    };
}

// Calculate Rainfall Irregularity Score (0-100 scale)
function calculateRainfallIrregularity(actualRainfall, expectedRainfall, state, season) {
    // Expected rainfall by season and region (simplified averages in mm)
    const expectedRainfallByRegion = {
        kharif: {
            default: 500,
            'Maharashtra': 600,
            'Punjab': 400,
            'Kerala': 800,
            'Rajasthan': 200
        },
        rabi: {
            default: 100,
            'Punjab': 150,
            'Uttar Pradesh': 120,
            'Tamil Nadu': 300
        },
        summer: {
            default: 50
        },
        zaid: {
            default: 200
        }
    };

    const expected = expectedRainfall ||
        expectedRainfallByRegion[season]?.[state] ||
        expectedRainfallByRegion[season]?.default ||
        300;

    // Calculate deviation percentage
    const deviation = ((actualRainfall - expected) / expected) * 100;
    const absDeviation = Math.abs(deviation);

    let irregularityScore = 0;
    let level = 'normal';

    if (absDeviation >= 50) {
        irregularityScore = 100;
        level = 'highly-irregular';
    } else if (absDeviation >= 25) {
        irregularityScore = 60;
        level = 'irregular';
    } else if (absDeviation >= 10) {
        irregularityScore = 30;
        level = 'normal';
    } else {
        irregularityScore = 10;
        level = 'normal';
    }

    return {
        value: Math.round(irregularityScore),
        level,
        totalRainfall: actualRainfall,
        expectedRainfall: expected,
        deviation: Math.round(deviation)
    };
}

// Get current season based on month
function getCurrentSeason(month) {
    // month: 0-11 (JavaScript Date month)
    if (month >= 5 && month <= 9) return 'kharif'; // June-October
    if (month >= 10 || month <= 2) return 'rabi'; // November-March
    if (month >= 2 && month <= 4) return 'summer'; // March-May
    return 'kharif';
}

// Calculate all climate stress indicators
function calculateAllStressIndicators(weatherData, farmDetails) {
    const { current, forecast } = weatherData;
    const { landType, location } = farmDetails;

    const currentMonth = new Date().getMonth();
    const season = getCurrentSeason(currentMonth);

    // Calculate total rainfall from forecast
    const totalForecastRainfall = forecast.reduce((sum, day) => sum + (day.rainfall || 0), 0);

    const heatStress = calculateHeatStress(
        current.temp,
        current.tempMax,
        season
    );

    const soilMoistureStress = calculateSoilMoistureStress(
        current.humidity,
        totalForecastRainfall,
        landType,
        season
    );

    const rainfallIrregularity = calculateRainfallIrregularity(
        totalForecastRainfall,
        null, // Will use defaults
        location.state,
        season
    );

    return {
        heatStressIndex: heatStress,
        soilMoistureStress,
        rainfallIrregularity,
        season
    };
}

module.exports = {
    calculateHeatStress,
    calculateSoilMoistureStress,
    calculateRainfallIrregularity,
    getCurrentSeason,
    calculateAllStressIndicators
};
