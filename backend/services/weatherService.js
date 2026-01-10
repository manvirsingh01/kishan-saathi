const axios = require('axios');

/**
 * Open-Meteo API Integration (Free, No API Key Required)
 * Enhanced with comprehensive weather data
 * Documentation: https://open-meteo.com/en/docs
 */

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

// Get current weather by coordinates with comprehensive data
async function getCurrentWeather(lat, lon) {
    try {
        const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
            params: {
                latitude: lat,
                longitude: lon,
                current: [
                    'temperature_2m',
                    'relative_humidity_2m',
                    'apparent_temperature',
                    'precipitation',
                    'rain',
                    'weather_code',
                    'cloud_cover',
                    'pressure_msl',
                    'surface_pressure',
                    'wind_speed_10m',
                    'wind_direction_10m',
                    'wind_gusts_10m'
                ].join(','),
                hourly: 'uv_index',
                timezone: 'Asia/Kolkata',
                forecast_days: 1
            }
        });

        const current = response.data.current;
        const hourly = response.data.hourly;

        // Get current hour UV index
        const currentHour = new Date().getHours();
        const uvIndex = hourly.uv_index[currentHour] || 0;

        return {
            temp: current.temperature_2m,
            feelsLike: current.apparent_temperature,
            tempMin: current.temperature_2m - 3,
            tempMax: current.temperature_2m + 3,
            humidity: current.relative_humidity_2m,
            pressure: current.pressure_msl || current.surface_pressure || 1013,
            windSpeed: current.wind_speed_10m,
            windDirection: current.wind_direction_10m,
            windGust: current.wind_gusts_10m,
            precipitation: current.precipitation || current.rain || 0,
            cloudCover: current.cloud_cover,
            uvIndex: uvIndex,
            visibility: 10, // Default 10km
            description: getWeatherDescription(current.weather_code),
            weatherCode: current.weather_code,
            timestamp: new Date(current.time)
        };
    } catch (error) {
        console.error('Open-Meteo current weather error:', error.message);
        throw new Error('Failed to fetch current weather data');
    }
}

// Get 7-day forecast by coordinates with detailed data
async function getForecast(lat, lon) {
    try {
        const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
            params: {
                latitude: lat,
                longitude: lon,
                daily: [
                    'temperature_2m_max',
                    'temperature_2m_min',
                    'precipitation_sum',
                    'precipitation_probability_max',
                    'weather_code',
                    'wind_speed_10m_max',
                    'uv_index_max'
                ].join(','),
                timezone: 'Asia/Kolkata',
                forecast_days: 7
            }
        });

        const daily = response.data.daily;
        const forecastByDay = [];

        for (let i = 0; i < Math.min(7, daily.time.length); i++) {
            forecastByDay.push({
                date: new Date(daily.time[i]),
                temp: (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2,
                tempMin: daily.temperature_2m_min[i],
                tempMax: daily.temperature_2m_max[i],
                humidity: 50,
                rainfall: daily.precipitation_sum[i] || 0,
                precipitationProbability: daily.precipitation_probability_max[i] || 0,
                windSpeed: daily.wind_speed_10m_max[i] || 0,
                uvIndex: daily.uv_index_max[i] || 0,
                conditions: getWeatherDescription(daily.weather_code[i]),
                weatherCode: daily.weather_code[i]
            });
        }

        return forecastByDay;
    } catch (error) {
        console.error('Open-Meteo forecast error:', error.message);
        throw new Error('Failed to fetch forecast data');
    }
}

// Get weather data (current + forecast)
async function getWeatherData(lat, lon) {
    try {
        const [current, forecast] = await Promise.all([
            getCurrentWeather(lat, lon),
            getForecast(lat, lon)
        ]);

        return {
            current,
            forecast
        };
    } catch (error) {
        console.error('Weather data fetch error:', error.message);
        throw error;
    }
}

// Convert WMO Weather codes to descriptions
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };

    return weatherCodes[code] || 'Unknown';
}

module.exports = {
    getCurrentWeather,
    getForecast,
    getWeatherData
};
