import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import RiskIndicator from '../components/RiskIndicator';
import { climateAPI } from '../utils/api';
import './ClimateStress.css';

function ClimateStress() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const fetchClimateStress = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await climateAPI.getStress();
            setData(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch climate stress data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClimateStress();
    }, []);

    return (
        <div className="page">
            <Navbar />

            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                <h1>Climate Stress Detection</h1>
                <p className="text-secondary mb-lg">
                    Real-time analysis of heat, soil moisture, and rainfall patterns affecting your farm
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                {loading ? (
                    <LoadingSpinner message="Analyzing climate data..." />
                ) : data ? (
                    <>
                        <div className="grid grid-3 gap-lg mb-xl">
                            <div className="card">
                                <h3 className="mb-md">🌡️ Heat Stress</h3>
                                <RiskIndicator level={data.stressIndicators.heatStressIndex.level} />
                                <div className="mt-md">
                                    <p className="text-sm"><strong>Index:</strong> {data.stressIndicators.heatStressIndex.value}/100</p>
                                    <p className="text-sm"><strong>Temperature:</strong> {data.stressIndicators.heatStressIndex.temperature}°C</p>
                                    <p className="text-sm"><strong>Max Temp:</strong> {data.stressIndicators.heatStressIndex.maxTemp}°C</p>
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="mb-md">💧 Soil Moisture</h3>
                                <RiskIndicator level={data.stressIndicators.soilMoistureStress.level} />
                                <div className="mt-md">
                                    <p className="text-sm"><strong>Stress Value:</strong> {data.stressIndicators.soilMoistureStress.value}/100</p>
                                    <p className="text-sm"><strong>Estimated Moisture:</strong> {data.stressIndicators.soilMoistureStress.estimatedMoisture}%</p>
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="mb-md">🌧️ Rainfall Irregularity</h3>
                                <RiskIndicator level={data.stressIndicators.rainfallIrregularity.level} />
                                <div className="mt-md">
                                    <p className="text-sm"><strong>Score:</strong> {data.stressIndicators.rainfallIrregularity.value}/100</p>
                                    <p className="text-sm"><strong>Total Rainfall:</strong> {data.stressIndicators.rainfallIrregularity.totalRainfall}mm</p>
                                    <p className="text-sm"><strong>Deviation:</strong> {data.stressIndicators.rainfallIrregularity.deviation}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="mb-md">Current Weather</h3>
                            <div className="grid grid-4 gap-md">
                                <div>
                                    <p className="text-sm text-secondary">Temperature</p>
                                    <p className="text-lg font-bold">{data.weatherData.current.temp}°C</p>
                                </div>
                                <div>
                                    <p className="text-sm text-secondary">Humidity</p>
                                    <p className="text-lg font-bold">{data.weatherData.current.humidity}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-secondary">Wind Speed</p>
                                    <p className="text-lg font-bold">{data.weatherData.current.windSpeed} m/s</p>
                                </div>
                                <div>
                                    <p className="text-sm text-secondary">Conditions</p>
                                    <p className="text-lg font-bold">{data.weatherData.current.description}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="card text-center">
                        <p>Click the button above to fetch climate stress data</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClimateStress;
