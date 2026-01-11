import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import RiskIndicator from '../components/RiskIndicator';
import { climateAPI, profileAPI } from '../utils/api';
import './MapDashboard.css';
import './TooltipStyles.css';

function Dashboard() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [climateData, setClimateData] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    // Get farm location reactively from user farmDetails
    const farmLocation = useMemo(() => {
        const coords = user?.farmDetails?.location?.coordinates;
        if (coords && Array.isArray(coords) && coords.length === 2) {
            return { lat: coords[1], lng: coords[0] };
        }
        return { lat: 28.6139, lng: 77.2090 }; // Default Delhi
    }, [user?.farmDetails?.location?.coordinates]);

    // Use current location if available, otherwise use farm location
    const displayLocation = currentLocation || farmLocation;

    useEffect(() => {
        // Only request current location once, not override farm location
        // requestCurrentLocation();
    }, []);

    useEffect(() => {
        if (displayLocation) {
            fetchClimateData(displayLocation.lat, displayLocation.lng);
        }
    }, [displayLocation.lat, displayLocation.lng]);

    const requestCurrentLocation = () => {
        setGettingLocation(true);

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setGettingLocation(false);
            fetchClimateData(farmLocation.lat, farmLocation.lng);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });
                setLocationError(null);
                setGettingLocation(false);

                // Update farm location in profile
                try {
                    await profileAPI.updateLocation({
                        coordinates: [longitude, latitude],
                        state: user?.farmDetails?.location?.state || 'Unknown',
                        district: 'Current Location'
                    });
                    console.log('Farm location updated to current location');
                } catch (error) {
                    console.error('Failed to update farm location:', error);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setLocationError('Could not get your location. Using farm location instead.');
                setGettingLocation(false);
                fetchClimateData(farmLocation.lat, farmLocation.lng);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const fetchClimateData = async (lat, lng) => {
        try {
            const params = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
            const response = await climateAPI.getStress(params);
            setClimateData(response.data);
        } catch (error) {
            console.error('Failed to fetch climate data:', error);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { id: 'climate', icon: '🌡️', title: 'Climate Stress', route: '/climate-stress', color: '#f59e0b' },
        { id: 'risk', icon: '⚠️', title: 'Risk Assessment', route: '/risk-assessment', color: '#ef4444' },
        { id: 'crops', icon: '🌾', title: 'Crop Recommendations', route: '/crop-recommendation', color: '#10b981' },
        { id: 'soil', icon: '🌱', title: 'Soil & Water', route: '/soil-water', color: '#8b5cf6' },
        { id: 'reports', icon: '📋', title: 'Loss Reports', route: '/loss-report', color: '#3b82f6' },
        { id: 'analytics', icon: '📊', title: 'Analytics', route: '/analytics', color: '#ec4899' }
    ];

    if (loading || gettingLocation) {
        return (
            <>
                <Navbar />
                <LoadingSpinner message={gettingLocation ? "Getting your location..." : "Loading dashboard..."} />
            </>
        );
    }

    return (
        <div className="map-dashboard">
            <Navbar />

            {locationError && (
                <div className="location-banner">
                    ⚠️ {locationError}
                </div>
            )}

            <div className="map-container">
                <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'}>
                    <Map
                        mapId="kishan-saathi-map"
                        center={displayLocation}
                        zoom={14}
                        gestureHandling="greedy"
                        disableDefaultUI={false}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <AdvancedMarker
                            position={displayLocation}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <div className="custom-marker">
                                <div className="marker-pin">{currentLocation ? '📍' : '🏠'}</div>
                                <div className="marker-label">
                                    {currentLocation ? 'Current Location' : user.farmDetails.location.district}
                                </div>
                            </div>
                        </AdvancedMarker>
                    </Map>
                </APIProvider>

                {/* Tooltip on Hover */}
                {showTooltip && climateData && (
                    <div className="climate-tooltip">
                        <h4 className="tooltip-title">
                            {currentLocation ? '📍 Current Location' : `🏠 ${user.name}'s Farm`}
                        </h4>

                        <div className="tooltip-section">
                            <div className="tooltip-row">
                                <span>🌡️ Heat:</span>
                                <RiskIndicator level={climateData.stressIndicators.heatStressIndex.level} />
                            </div>
                            <div className="tooltip-row">
                                <span>💧 Moisture:</span>
                                <RiskIndicator level={climateData.stressIndicators.soilMoistureStress.level} />
                            </div>
                            <div className="tooltip-row">
                                <span>🌧️ Rainfall:</span>
                                <RiskIndicator level={climateData.stressIndicators.rainfallIrregularity.level} />
                            </div>
                        </div>

                        <div className="tooltip-section">
                            <div className="tooltip-row">
                                <span>🌊 Flood:</span>
                                <RiskIndicator level={climateData.riskAssessment.floodRisk.level} />
                                <span className="risk-percent">{climateData.riskAssessment.floodRisk.probability}%</span>
                            </div>
                            <div className="tooltip-row">
                                <span>☀️ Drought:</span>
                                <RiskIndicator level={climateData.riskAssessment.droughtRisk.level} />
                                <span className="risk-percent">{climateData.riskAssessment.droughtRisk.probability}%</span>
                            </div>
                        </div>

                        <div className="tooltip-section weather-section">
                            <div className="tooltip-row">
                                <span>🌡️ {climateData.weatherData.current.temp}°C</span>
                                <span>💧 {climateData.weatherData.current.humidity}%</span>
                            </div>
                            <div className="tooltip-row">
                                <span>💨 {climateData.weatherData.current.windSpeed} m/s</span>
                                <span>☁️ {climateData.weatherData.current.cloudCover}%</span>
                            </div>
                        </div>
                    </div>
                )}

                <button className="refresh-location-btn" onClick={requestCurrentLocation}>
                    📍 {t('dashboard.updateLocation')}
                </button>

                <div className="feature-panel">
                    <div className="panel-header">
                        <h2>{t('dashboard.quickActions')}</h2>
                        <p className="panel-subtitle">Access your farming tools</p>
                    </div>

                    <div className="feature-grid">
                        {features.map(feature => (
                            <a
                                key={feature.id}
                                href={feature.route}
                                className="feature-card"
                                style={{ borderLeftColor: feature.color }}
                                onMouseEnter={() => setSelectedFeature(feature.id)}
                                onMouseLeave={() => setSelectedFeature(null)}
                            >
                                <div className="feature-icon" style={{ color: feature.color }}>
                                    {feature.icon}
                                </div>
                                <div className="feature-content">
                                    <h3 className="feature-title">{feature.title}</h3>
                                    {selectedFeature === feature.id && (
                                        <p className="feature-desc">Click to view details</p>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="farm-info-card">
                    <div className="farm-header">
                        <h3>🌾 {user.farmDetails?.name || `${user.name}'s Farm`}</h3>
                        <span className="farm-badge">
                            {currentLocation ? '📡 Live Location' : '🏠 Farm Base'}
                        </span>
                    </div>
                    <div className="farm-details">
                        <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span className="detail-text">
                                {user.farmDetails?.location?.village || user.farmDetails?.location?.district}, {user.farmDetails?.location?.state}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">📏</span>
                            <span className="detail-text">{user.farmDetails?.landArea || 0} hectares</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">🌾</span>
                            <span className="detail-text">{user.farmDetails?.soilType || 'N/A'} soil</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">💧</span>
                            <span className="detail-text">{user.farmDetails?.landType || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="farm-quick-links">
                        <a href="/government" className="quick-link">
                            🏛️ {user.farmDetails?.location?.state} Policies & Prices
                        </a>
                        <a href="/profile" className="quick-link secondary">
                            ✏️ Manage Farms
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
