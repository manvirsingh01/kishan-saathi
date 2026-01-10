const axios = require('axios');

/**
 * Google Weather API Integration
 * Provides comprehensive weather data and climate analysis
 * Requires GOOGLE_WEATHER_API_KEY in environment variables
 */

const GOOGLE_WEATHER_BASE_URL = 'https://weather.googleapis.com/v1';

/**
 * Get current weather conditions
 */
async function getCurrentConditions(lat, lon) {
    try {
        const apiKey = process.env.GOOGLE_WEATHER_API_KEY;

        if (!apiKey) {
            console.warn('Google Weather API key not found, using fallback');
            return null;
        }

        const response = await axios.get(`${GOOGLE_WEATHER_BASE_URL}/currentConditions:lookup`, {
            params: {
                key: apiKey,
                'location.latitude': lat,
                'location.longitude': lon
            }
        });

        const data = response.data;
        return {
            temperature: data.temperature?.value || 0,
            temperatureUnit: data.temperature?.unit || 'celsius',
            humidity: data.relativeHumidity?.value || 0,
            windSpeed: data.windSpeed?.value || 0,
            windDirection: data.windDirection?.value || 0,
            cloudCover: data.cloudCover?.value || 0,
            uvIndex: data.uvIndex?.value || 0,
            visibility: data.visibility?.value || 10000,
            dewPoint: data.dewPoint?.value || 0,
            pressure: data.pressure?.value || 1013,
            condition: data.weatherConditions || 'Unknown',
            timestamp: new Date()
        };
    } catch (error) {
        // Silently return null - API not available
        return null;
    }
}

/**
 * Get daily forecast (up to 15 days)
 */
async function getDailyForecast(lat, lon, days = 7) {
    try {
        const apiKey = process.env.GOOGLE_WEATHER_API_KEY;

        if (!apiKey) {
            return null;
        }

        const response = await axios.get(`${GOOGLE_WEATHER_BASE_URL}/forecast/days:lookup`, {
            params: {
                key: apiKey,
                'location.latitude': lat,
                'location.longitude': lon,
                days: Math.min(days, 15)
            }
        });

        const forecasts = response.data.dailyForecasts || [];

        return forecasts.map(day => ({
            date: new Date(day.date),
            tempMax: day.temperature?.max?.value || 0,
            tempMin: day.temperature?.min?.value || 0,
            precipitationProbability: day.precipitationProbability?.value || 0,
            precipitationAmount: day.precipitationAmount?.value || 0,
            humidity: day.relativeHumidity?.value || 0,
            windSpeed: day.windSpeed?.max?.value || 0,
            uvIndex: day.uvIndex?.max?.value || 0,
            condition: day.weatherConditions || 'Unknown'
        }));
    } catch (error) {
        // Silently return null - API not available
        return null;
    }
}

/**
 * Get hourly forecast (up to 120 hours / 5 days)
 */
async function getHourlyForecast(lat, lon, hours = 48) {
    try {
        const apiKey = process.env.GOOGLE_WEATHER_API_KEY;

        if (!apiKey) {
            return null;
        }

        const response = await axios.get(`${GOOGLE_WEATHER_BASE_URL}/forecast/hours:lookup`, {
            params: {
                key: apiKey,
                'location.latitude': lat,
                'location.longitude': lon,
                hours: Math.min(hours, 120)
            }
        });

        const forecasts = response.data.hourlyForecasts || [];

        return forecasts.map(hour => ({
            time: new Date(hour.time),
            temperature: hour.temperature?.value || 0,
            precipitationProbability: hour.precipitationProbability?.value || 0,
            humidity: hour.relativeHumidity?.value || 0,
            windSpeed: hour.windSpeed?.value || 0,
            condition: hour.weatherConditions || 'Unknown'
        }));
    } catch (error) {
        // Silently return null - API not available
        return null;
    }
}

/**
 * Get historical weather data
 */
async function getHistoricalData(lat, lon, hoursBack = 24) {
    try {
        const apiKey = process.env.GOOGLE_WEATHER_API_KEY;

        if (!apiKey) {
            return null;
        }

        const response = await axios.get(`${GOOGLE_WEATHER_BASE_URL}/history/hours:lookup`, {
            params: {
                key: apiKey,
                'location.latitude': lat,
                'location.longitude': lon,
                hours: Math.min(hoursBack, 720) // Max 30 days
            }
        });

        const history = response.data.hourlyHistory || [];

        return history.map(hour => ({
            time: new Date(hour.time),
            temperature: hour.temperature?.value || 0,
            precipitation: hour.precipitation?.value || 0,
            humidity: hour.relativeHumidity?.value || 0
        }));
    } catch (error) {
        // Silently return null - API not available
        return null;
    }
}

/**
 * Get public weather alerts
 */
async function getWeatherAlerts(lat, lon, languageCode = 'en') {
    try {
        const apiKey = process.env.GOOGLE_WEATHER_API_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await axios.get(`${GOOGLE_WEATHER_BASE_URL}/publicAlerts:lookup`, {
            params: {
                key: apiKey,
                'location.latitude': lat,
                'location.longitude': lon,
                languageCode
            }
        });

        const alerts = response.data.alerts || [];

        return alerts.map(alert => ({
            severity: alert.severity || 'unknown',
            urgency: alert.urgency || 'unknown',
            event: alert.event || 'Unknown Event',
            headline: alert.headline || '',
            description: alert.description || '',
            instruction: alert.instruction || '',
            areas: alert.areas || [],
            startTime: alert.startTime ? new Date(alert.startTime) : null,
            endTime: alert.endTime ? new Date(alert.endTime) : null
        }));
    } catch (error) {
        // Silently return empty array - API not available
        return [];
    }
}

/**
 * Comprehensive weather analysis for agriculture
 */
async function analyzeClimateForAgriculture(lat, lon) {
    try {
        // Fetch all weather data in parallel
        const [current, daily, hourly, alerts] = await Promise.all([
            getCurrentConditions(lat, lon),
            getDailyForecast(lat, lon, 7),
            getHourlyForecast(lat, lon, 48),
            getWeatherAlerts(lat, lon, 'en')
        ]);

        // If Google API fails, return null to use fallback
        if (!current && !daily) {
            return null;
        }

        // Analyze temperature stress
        const temperatureAnalysis = analyzeTemperature(current, daily);

        // Analyze precipitation patterns
        const precipitationAnalysis = analyzePrecipitation(current, daily, hourly);

        // Analyze humidity and moisture
        const moistureAnalysis = analyzeMoisture(current, daily);

        // Analyze wind conditions
        const windAnalysis = analyzeWind(current, daily);

        // Calculate agricultural risk factors
        const riskFactors = calculateAgriculturalRisks(
            temperatureAnalysis,
            precipitationAnalysis,
            moistureAnalysis,
            current,
            alerts
        );

        // Generate farming recommendations
        const recommendations = generateFarmingRecommendations(
            temperatureAnalysis,
            precipitationAnalysis,
            moistureAnalysis,
            riskFactors,
            alerts
        );

        return {
            current,
            daily,
            hourly: hourly?.slice(0, 24), // Next 24 hours
            alerts,
            analysis: {
                temperature: temperatureAnalysis,
                precipitation: precipitationAnalysis,
                moisture: moistureAnalysis,
                wind: windAnalysis,
                riskFactors,
                recommendations
            },
            generatedAt: new Date()
        };
    } catch (error) {
        // Silently return null to use fallback
        return null;
    }
}

// Helper: Analyze temperature patterns
function analyzeTemperature(current, daily) {
    if (!daily || daily.length === 0) return {};

    const temps = daily.map(d => (d.tempMax + d.tempMin) / 2);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxTemp = Math.max(...daily.map(d => d.tempMax));
    const minTemp = Math.min(...daily.map(d => d.tempMin));

    return {
        current: current?.temperature || 0,
        average7Day: Math.round(avgTemp * 10) / 10,
        max7Day: maxTemp,
        min7Day: minTemp,
        heatStressRisk: maxTemp > 35 ? 'high' : maxTemp > 30 ? 'medium' : 'low',
        coldStressRisk: minTemp < 10 ? 'high' : minTemp < 15 ? 'medium' : 'low',
        optimalForCrops: avgTemp >= 20 && avgTemp <= 30
    };
}

// Helper: Analyze precipitation
function analyzePrecipitation(current, daily, hourly) {
    if (!daily || daily.length === 0) return {};

    const totalRain = daily.reduce((sum, d) => sum + (d.precipitationAmount || 0), 0);
    const rainyDays = daily.filter(d => (d.precipitationAmount || 0) > 1).length;
    const avgPrecipProb = daily.reduce((sum, d) => sum + d.precipitationProbability, 0) / daily.length;

    // Analyze next 24 hours for immediate rain
    const next24hRain = hourly?.slice(0, 24).reduce((sum, h) =>
        sum + (h.precipitationProbability > 50 ? 1 : 0), 0) || 0;

    return {
        total7Day: Math.round(totalRain * 10) / 10,
        rainyDays,
        averageProbability: Math.round(avgPrecipProb),
        next24hRainHours: next24hRain,
        irrigationNeeded: totalRain < 25 && avgPrecipProb < 30,
        droughtRisk: totalRain < 10 ? 'high' : totalRain < 25 ? 'medium' : 'low',
        floodRisk: totalRain > 100 ? 'high' : totalRain > 75 ? 'medium' : 'low'
    };
}

// Helper: Analyze moisture
function analyzeMoisture(current, daily) {
    if (!daily || daily.length === 0) return {};

    const avgHumidity = daily.reduce((sum, d) => sum + d.humidity, 0) / daily.length;

    return {
        currentHumidity: current?.humidity || 0,
        average7Day: Math.round(avgHumidity),
        soilMoistureEstimate: avgHumidity > 70 ? 'high' : avgHumidity > 50 ? 'medium' : 'low',
        fungalDiseaseRisk: avgHumidity > 80 ? 'high' : avgHumidity > 65 ? 'medium' : 'low'
    };
}

// Helper: Analyze wind
function analyzeWind(current, daily) {
    if (!daily || daily.length === 0) return {};

    const maxWind = Math.max(...daily.map(d => d.windSpeed));
    const avgWind = daily.reduce((sum, d) => sum + d.windSpeed, 0) / daily.length;

    return {
        current: current?.windSpeed || 0,
        max7Day: Math.round(maxWind * 10) / 10,
        average7Day: Math.round(avgWind * 10) / 10,
        cropDamageRisk: maxWind > 50 ? 'high' : maxWind > 30 ? 'medium' : 'low'
    };
}

// Helper: Calculate agricultural risks
function calculateAgriculturalRisks(temp, precip, moisture, current, alerts) {
    const risks = [];

    // Heat stress
    if (temp.heatStressRisk === 'high') {
        risks.push({
            type: 'heat_stress',
            severity: 'high',
            message: '⚠️ High temperature alert! Crops may experience heat stress.',
            action: 'Increase irrigation frequency and provide shade if possible.'
        });
    }

    // Drought
    if (precip.droughtRisk === 'high') {
        risks.push({
            type: 'drought',
            severity: 'high',
            message: '💧 Low rainfall expected. Drought conditions likely.',
            action: 'Plan for supplemental irrigation. Consider drought-resistant crops.'
        });
    }

    // Flood
    if (precip.floodRisk === 'high') {
        risks.push({
            type: 'flood',
            severity: 'high',
            message: '🌊 Heavy rainfall expected. Flood risk is high.',
            action: 'Ensure proper drainage. Protect crops from waterlogging.'
        });
    }

    // Fungal disease
    if (moisture.fungalDiseaseRisk === 'high') {
        risks.push({
            type: 'disease',
            severity: 'medium',
            message: '🦠 High humidity may promote fungal diseases.',
            action: 'Monitor crops closely. Apply preventive fungicides if needed.'
        });
    }

    // Wind damage
    if (current?.windSpeed > 40) {
        risks.push({
            type: 'wind',
            severity: 'medium',
            message: '💨 Strong winds detected.',
            action: 'Secure tall crops and protect young seedlings.'
        });
    }

    // Add alert-based risks
    alerts.forEach(alert => {
        if (alert.severity === 'severe' || alert.severity === 'extreme') {
            risks.push({
                type: 'weather_alert',
                severity: 'high',
                message: `⚡ ${alert.event}: ${alert.headline}`,
                action: alert.instruction || 'Follow official guidance.'
            });
        }
    });

    return risks;
}

// Helper: Generate farming recommendations
function generateFarmingRecommendations(temp, precip, moisture, risks, alerts) {
    const recommendations = [];

    // Irrigation
    if (precip.irrigationNeeded) {
        recommendations.push({
            category: 'irrigation',
            priority: 'high',
            title: 'Irrigation Required',
            description: 'Low rainfall expected in coming days. Plan for irrigation.',
            icon: '💧'
        });
    }

    // Planting timing
    if (temp.optimalForCrops && precip.next24hRainHours < 5) {
        recommendations.push({
            category: 'planting',
            priority: 'medium',
            title: 'Good Planting Conditions',
            description: 'Temperature and moisture conditions are favorable for planting.',
            icon: '🌱'
        });
    }

    // Fertilizer application
    if (precip.next24hRainHours > 10) {
        recommendations.push({
            category: 'fertilizer',
            priority: 'medium',
            title: 'Delay Fertilizer Application',
            description: 'Heavy rain expected. Wait for drier conditions to apply fertilizers.',
            icon: '🧪'
        });
    }

    // Pest control
    if (moisture.fungalDiseaseRisk === 'high') {
        recommendations.push({
            category: 'pest_control',
            priority: 'high',
            title: 'Disease Prevention',
            description: 'High humidity increases disease risk. Monitor and apply preventive measures.',
            icon: '🛡️'
        });
    }

    // Harvesting
    if (precip.next24hRainHours === 0 && temp.current > 20 && temp.current < 35) {
        recommendations.push({
            category: 'harvesting',
            priority: 'medium',
            title: 'Good Harvesting Weather',
            description: 'Dry conditions with moderate temperature - ideal for harvesting.',
            icon: '🌾'
        });
    }

    return recommendations;
}

module.exports = {
    getCurrentConditions,
    getDailyForecast,
    getHourlyForecast,
    getHistoricalData,
    getWeatherAlerts,
    analyzeClimateForAgriculture
};
