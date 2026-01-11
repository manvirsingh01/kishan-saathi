import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import { authAPI } from '../utils/api';
import './Auth.css';

function Login() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            const response = await authAPI.login(formData);
            login(response.data.user, response.data.token);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        setError('');

        const demoCredentials = {
            email: 'demo@kishansaathi.com',
            password: 'demo123'
        };

        try {
            // Try to login first
            const response = await authAPI.login(demoCredentials);
            login(response.data.user, response.data.token);
            navigate('/dashboard');
        } catch (loginError) {
            // If login fails, try to register the demo user (likely doesn't exist)
            try {
                console.log('Demo user not found, registering...');
                const demoUser = {
                    name: 'Kishan Demo',
                    email: demoCredentials.email,
                    password: demoCredentials.password,
                    phone: '9876543210',
                    farmDetails: {
                        location: {
                            coordinates: [73.0243, 26.2389], // Jodhpur
                            state: 'Rajasthan',
                            district: 'Jodhpur'
                        },
                        landArea: 5.5,
                        landType: 'irrigated',
                        soilType: 'desert',
                        waterSource: [],
                        currentCrops: []
                    }
                };

                const registerResponse = await authAPI.register(demoUser);
                login(registerResponse.data.user, registerResponse.data.token);
                navigate('/dashboard');
            } catch (registerError) {
                console.error('Demo registration failed:', registerError);
                setError('Demo login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🌾 {t('appName')}</h1>
                    <p className="auth-tagline">{t('tagline')}</p>
                </div>

                <h2 className="auth-title">{t('auth.login')}</h2>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">{t('auth.email')}</label>
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
                        <label className="form-label">{t('auth.password')}</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="auth-actions">
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? t('common.loading') : t('auth.loginButton')}
                        </button>

                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="btn btn-secondary btn-block mt-md"
                            disabled={loading}
                            style={{ backgroundColor: '#4caf50', color: 'white' }}
                        >
                            🚀 Easy Demo Login
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>{t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
