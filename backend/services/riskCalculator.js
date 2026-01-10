/**
 * Risk Calculator Service
 * Calculates Flood and Drought Risk Probabilities
 */

// Calculate Flood Risk Probability
function calculateFloodRisk(weatherData, farmDetails, climateStress) {
    const { forecast } = weatherData;
    const { landType, location } = farmDetails;

    let probability = 0;
    const factors = [];

    // Factor 1: Heavy rainfall prediction
    const totalRainfall = forecast.reduce((sum, day) => sum + (day.rainfall || 0), 0);
    if (totalRainfall > 200) {
        probability += 40;
        factors.push('Heavy rainfall predicted (>200mm)');
    } else if (totalRainfall > 100) {
        probability += 25;
        factors.push('Moderate rainfall predicted (>100mm)');
    } else if (totalRainfall > 50) {
        probability += 10;
        factors.push('Light to moderate rainfall');
    }

    // Factor 2: Land type vulnerability
    if (landType === 'rainfed') {
        probability += 20;
        factors.push('Rainfed land more vulnerable');
    } else if (landType === 'mixed') {
        probability += 10;
    }

    // Factor 3: Rainfall irregularity
    if (climateStress.rainfallIrregularity.level === 'highly-irregular' &&
        climateStress.rainfallIrregularity.deviation > 0) {
        probability += 20;
        factors.push('High rainfall irregularity detected');
    }

    // Factor 4: Regional flood-prone areas (simplified)
    const floodProneStates = [
        'Assam', 'Bihar', 'Uttar Pradesh', 'West Bengal',
        'Odisha', 'Kerala', 'Maharashtra', 'Gujarat'
    ];
    if (floodProneStates.includes(location.state)) {
        probability += 10;
        factors.push(`${location.state} is in flood-prone region`);
    }

    // Cap at 100
    probability = Math.min(probability, 100);

    let level = 'low';
    if (probability >= 60) level = 'high';
    else if (probability >= 30) level = 'medium';

    return {
        probability: Math.round(probability),
        level,
        factors
    };
}

// Calculate Drought Risk Probability
function calculateDroughtRisk(weatherData, farmDetails, climateStress) {
    const { current, forecast } = weatherData;
    const { landType, location, waterSource } = farmDetails;

    let probability = 0;
    const factors = [];

    // Factor 1: Low rainfall
    const totalRainfall = forecast.reduce((sum, day) => sum + (day.rainfall || 0), 0);
    if (totalRainfall < 10) {
        probability += 40;
        factors.push('Very low rainfall predicted (<10mm)');
    } else if (totalRainfall < 30) {
        probability += 25;
        factors.push('Low rainfall predicted (<30mm)');
    } else if (totalRainfall < 50) {
        probability += 10;
        factors.push('Below normal rainfall');
    }

    // Factor 2: High temperature
    if (climateStress.heatStressIndex.level === 'extreme') {
        probability += 25;
        factors.push('Extreme heat stress detected');
    } else if (climateStress.heatStressIndex.level === 'high') {
        probability += 15;
        factors.push('High heat stress detected');
    }

    // Factor 3: Soil moisture stress
    if (climateStress.soilMoistureStress.level === 'critical') {
        probability += 20;
        factors.push('Critical soil moisture deficit');
    } else if (climateStress.soilMoistureStress.level === 'severe') {
        probability += 12;
        factors.push('Severe soil moisture stress');
    }

    // Factor 4: Land type and water source
    if (landType === 'rainfed' && (!waterSource || waterSource.length === 0)) {
        probability += 15;
        factors.push('Rainfed land with no irrigation');
    } else if (landType === 'rainfed') {
        probability += 8;
        factors.push('Rainfed land dependent on rainfall');
    }

    // Factor 5: Drought-prone regions
    const droughtProneStates = [
        'Rajasthan', 'Gujarat', 'Maharashtra', 'Karnataka',
        'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Madhya Pradesh'
    ];
    if (droughtProneStates.includes(location.state)) {
        probability += 10;
        factors.push(`${location.state} is in drought-prone region`);
    }

    // Cap at 100
    probability = Math.min(probability, 100);

    let level = 'low';
    if (probability >= 60) level = 'high';
    else if (probability >= 30) level = 'medium';

    return {
        probability: Math.round(probability),
        level,
        factors
    };
}

// Calculate both flood and drought risks
function calculateRiskAssessment(weatherData, farmDetails, climateStress) {
    const floodRisk = calculateFloodRisk(weatherData, farmDetails, climateStress);
    const droughtRisk = calculateDroughtRisk(weatherData, farmDetails, climateStress);

    return {
        floodRisk,
        droughtRisk,
        calculatedAt: new Date()
    };
}

module.exports = {
    calculateFloodRisk,
    calculateDroughtRisk,
    calculateRiskAssessment
};
