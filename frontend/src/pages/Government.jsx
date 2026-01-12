import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import './Government.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Government() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('policies');
    const [govData, setGovData] = useState(null);

    // Get current farm location
    const farmState = user?.farmDetails?.location?.state || 'Your State';
    const farmDistrict = user?.farmDetails?.location?.district || 'Your District';

    useEffect(() => {
        fetchGovernmentData();
    }, [user?.activeFarmId]); // Refetch when farm changes

    const fetchGovernmentData = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/government/ai/comprehensive`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGovData(response.data);
        } catch (err) {
            console.error('Failed to fetch government data:', err);
            setError(err.response?.data?.error || 'Failed to load government information');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'policies', label: '🏛️ Policies & Schemes', icon: '🏛️' },
        { id: 'prices', label: '💰 MSP & Prices', icon: '💰' },
        { id: 'resources', label: '📞 Resources', icon: '📞' }
    ];

    if (loading) {
        return (
            <div className="page">
                <Navbar />
                <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
                    <LoadingSpinner />
                    <p>Loading government information for {farmState}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page government-page">
            <Navbar />
            <div className="container" style={{ paddingTop: '1.5rem' }}>
                {/* Header with location */}
                <div className="gov-header">
                    <h1>🏛️ Government Information</h1>
                    <div className="location-badge">
                        📍 {farmDistrict}, {farmState}
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {/* Tab Navigation */}
                <div className="gov-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Policies Tab */}
                    {activeTab === 'policies' && govData?.policies && (
                        <div className="policies-content">
                            <section className="gov-section">
                                <h2>🇮🇳 Central Government Schemes</h2>
                                <div className="schemes-grid">
                                    {govData.policies.centralSchemes?.map((scheme, i) => (
                                        <div key={i} className="scheme-card">
                                            <h3>{scheme.name}</h3>
                                            <p>{scheme.description}</p>
                                            <div className="scheme-details">
                                                <span className="tag">👤 {scheme.eligibility}</span>
                                                <span className="tag benefit">💵 {scheme.benefits}</span>
                                            </div>
                                            {scheme.website && (
                                                <a href={scheme.website} target="_blank" rel="noopener noreferrer" className="scheme-link">
                                                    🔗 Official Website
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="gov-section">
                                <h2>🏛️ {farmState} State Schemes</h2>
                                <div className="schemes-grid">
                                    {govData.policies.stateSchemes?.map((scheme, i) => (
                                        <div key={i} className="scheme-card state">
                                            <h3>{scheme.name}</h3>
                                            <p>{scheme.description}</p>
                                            <div className="scheme-details">
                                                <span className="tag">👤 {scheme.eligibility}</span>
                                                <span className="tag benefit">💵 {scheme.benefits}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="gov-section">
                                <h2>💰 Subsidies Available</h2>
                                <div className="subsidies-grid">
                                    {govData.policies.subsidies?.map((subsidy, i) => (
                                        <div key={i} className="subsidy-card">
                                            <h4>{subsidy.type}</h4>
                                            <div className="subsidy-amount">{subsidy.amount}</div>
                                            <p>For: {subsidy.applicableFor}</p>
                                            <small>Apply at: {subsidy.howToApply}</small>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="gov-section">
                                <h2>🔗 Official Websites</h2>
                                <div className="websites-grid">
                                    {govData.policies.officialWebsites?.map((site, i) => (
                                        <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" className="website-card">
                                            <h4>{site.name}</h4>
                                            <p>{site.description}</p>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Prices Tab */}
                    {activeTab === 'prices' && govData?.prices && (
                        <div className="prices-content">
                            <section className="gov-section">
                                <h2>🌾 Minimum Support Prices (MSP) 2024-25</h2>
                                <div className="prices-table-wrapper">
                                    <table className="prices-table">
                                        <thead>
                                            <tr>
                                                <th>Crop</th>
                                                <th>हिंदी</th>
                                                <th>MSP</th>
                                                <th>Current Price</th>
                                                <th>Trend</th>
                                                <th>Season</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {govData.prices.crops?.map((crop, i) => (
                                                <tr key={i}>
                                                    <td><strong>{crop.name}</strong></td>
                                                    <td>{crop.hindiName}</td>
                                                    <td className="price-cell">{crop.msp}</td>
                                                    <td className="price-cell">{crop.currentPrice}</td>
                                                    <td>
                                                        <span className={`trend ${crop.trend}`}>
                                                            {crop.trend === 'increasing' ? '📈' : crop.trend === 'decreasing' ? '📉' : '➡️'} {crop.trend}
                                                        </span>
                                                    </td>
                                                    <td>{crop.season}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section className="gov-section">
                                <h2>🏪 Nearby Markets</h2>
                                <div className="markets-grid">
                                    {govData.prices.markets?.map((market, i) => (
                                        <div key={i} className="market-card">
                                            <h4>{market.name}</h4>
                                            <p>📍 {market.location} • {market.type}</p>
                                            <div className="facilities">
                                                {market.facilities?.map((f, j) => (
                                                    <span key={j} className="facility-tag">{f}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="gov-section">
                                <h2>🌐 Online Price Resources</h2>
                                <div className="websites-grid">
                                    {govData.prices.onlineResources?.map((resource, i) => (
                                        <a key={i} href={resource.url} target="_blank" rel="noopener noreferrer" className="website-card">
                                            <h4>{resource.name}</h4>
                                            <p>{resource.features}</p>
                                            <small>Coverage: {resource.coverage}</small>
                                        </a>
                                    ))}
                                </div>
                            </section>

                            {govData.prices.disclaimer && (
                                <p className="disclaimer">⚠️ {govData.prices.disclaimer}</p>
                            )}
                        </div>
                    )}

                    {/* Resources Tab */}
                    {activeTab === 'resources' && govData?.resources && (
                        <div className="resources-content">
                            <section className="gov-section">
                                <h2>📞 Helplines</h2>
                                <div className="helplines-grid">
                                    {govData.resources.helplines?.map((helpline, i) => (
                                        <div key={i} className="helpline-card">
                                            <h4>{helpline.name}</h4>
                                            <div className="helpline-number">{helpline.number}</div>
                                            <p>⏰ {helpline.availability}</p>
                                            <div className="languages">
                                                {helpline.languages?.map((lang, j) => (
                                                    <span key={j} className="lang-tag">{lang}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="gov-section">
                                <h2>🏢 Agricultural Departments</h2>
                                <div className="depts-grid">
                                    {govData.resources.departments?.map((dept, i) => (
                                        <div key={i} className="dept-card">
                                            <h4>{dept.name}</h4>
                                            <ul>
                                                {dept.services?.map((service, j) => (
                                                    <li key={j}>{service}</li>
                                                ))}
                                            </ul>
                                            {dept.website && (
                                                <a href={dept.website} target="_blank" rel="noopener noreferrer">
                                                    🔗 Visit Website
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="gov-section">
                                <h2>🏫 Training & Institutions</h2>
                                <div className="institutions-grid">
                                    {govData.resources.institutions?.map((inst, i) => (
                                        <div key={i} className="inst-card">
                                            <h4>{inst.name}</h4>
                                            <p className="inst-type">{inst.type} • {inst.location}</p>
                                            <ul>
                                                {inst.services?.map((service, j) => (
                                                    <li key={j}>{service}</li>
                                                ))}
                                            </ul>
                                            <small>📞 {inst.contact}</small>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="gov-section">
                                <h2>📱 Mobile Apps</h2>
                                <div className="apps-grid">
                                    {govData.resources.mobileApps?.map((app, i) => (
                                        <div key={i} className="app-card">
                                            <h4>{app.name}</h4>
                                            <p>{app.purpose}</p>
                                            <span className="platform">{app.platform}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Last Updated */}
                {govData && (
                    <div className="last-updated">
                        Last updated: {new Date(govData.generatedAt).toLocaleString()} • Data for {farmState}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Government;
