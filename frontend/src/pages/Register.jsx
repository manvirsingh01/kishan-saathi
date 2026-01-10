import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import { authAPI } from '../utils/api';
import axios from 'axios';
import './Auth.css';

function Register() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        state: '',
        district: '',
        landArea: '',
        landType: 'irrigated',
        soilType: 'alluvial',
        coordinates: null
    });
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-detect location on component mount
    useEffect(() => {
        detectLocation();
    }, []);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse geocode to get state and district
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );

                    const data = response.data;
                    const address = data.address || {};

                    setFormData(prev => ({
                        ...prev,
                        state: address.state || '',
                        district: address.county || address.district || address.city || '',
                        coordinates: [longitude, latitude]
                    }));
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                    // At least save coordinates
                    setFormData(prev => ({
                        ...prev,
                        coordinates: [longitude, latitude]
                    }));
                } finally {
                    setLocationLoading(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setLocationLoading(false);
            }
        );
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const coordinates = formData.coordinates || [77.2090, 28.6139]; // Fallback to Delhi

            const registerData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                farmDetails: {
                    location: {
                        coordinates,
                        state: formData.state,
                        district: formData.district
                    },
                    landArea: parseFloat(formData.landArea),
                    landType: formData.landType,
                    soilType: formData.soilType,
                    waterSource: [],
                    currentCrops: []
                }
            };

            const response = await authAPI.register(registerData);
            login(response.data.user, response.data.token);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card auth-card-large">
                <div className="auth-header">
                    <h1>🌾 {t('appName')}</h1>
                    <p className="auth-tagline">{t('tagline')}</p>
                </div>

                <h2 className="auth-title">{t('auth.register')}</h2>

                {error && <div className="alert alert-error">{error}</div>}
                {locationLoading && (
                    <div className="alert alert-info">📍 Detecting your location...</div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">{t('auth.name')} *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('auth.phone')} *</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10 digits"
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.email')} *</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.password')} *</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            minLength="6"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                State * {formData.coordinates && '📍'}
                            </label>
                            <input
                                type="text"
                                name="state"
                                className="form-input"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder={locationLoading ? 'Detecting...' : 'Auto-detected or enter manually'}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                District * {formData.coordinates && '📍'}
                            </label>
                            <input
                                type="text"
                                name="district"
                                className="form-input"
                                value={formData.district}
                                onChange={handleChange}
                                placeholder={locationLoading ? 'Detecting...' : 'Auto-detected or enter manually'}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Land Area (hectares) *</label>
                            <input
                                type="number"
                                name="landArea"
                                className="form-input"
                                value={formData.landArea}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Land Type *</label>
                            <select
                                name="landType"
                                className="form-select"
                                value={formData.landType}
                                onChange={handleChange}
                                required
                            >
                                <option value="irrigated">Irrigated</option>
                                <option value="rainfed">Rainfed</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Soil Type *</label>
                        <select
                            name="soilType"
                            className="form-select"
                            value={formData.soilType}
                            onChange={handleChange}
                            required
                        >
                            <option value="alluvial">Alluvial</option>
                            <option value="black">Black</option>
                            <option value="red">Red</option>
                            <option value="laterite">Laterite</option>
                            <option value="desert">Desert</option>
                            <option value="mountain">Mountain</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? t('common.loading') : t('auth.registerButton')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>{t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
