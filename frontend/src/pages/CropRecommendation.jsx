import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import './CropRecommendation.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function CropRecommendation() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('ai');
    const [season, setSeason] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
        } else {
            alert('Please select a PDF file');
        }
    };

    const handlePDFUpload = async () => {
        if (!selectedFile) {
            alert('Please select a soil report PDF');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('soilReport', selectedFile);

            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/soil-reports/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setRecommendations(response.data.report);
            alert('Soil report analyzed successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to analyze soil report: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleAIRecommendation = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/crops/recommend`,
                { season },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRecommendations({ cropRecommendations: response.data.recommendations });
        } catch (error) {
            console.error('AI recommendation error:', error);
            alert('Failed to get recommendations: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Helper function to safely display market price
    const displayMarketPrice = (price) => {
        if (!price) return 'N/A';
        if (typeof price === 'object') {
            return `₹${price.msp || price.current || ''}`;
        }
        return price;
    };

    // Helper function to safely display yield
    const displayYield = (yield_data) => {
        if (!yield_data) return 'N/A';
        if (typeof yield_data === 'object') {
            return `${yield_data.min}-${yield_data.max} ${yield_data.unit || 'quintals/hectare'}`;
        }
        return yield_data;
    };

    return (
        <div className="crop-recommendation-page">
            <Navbar />

            <div className="page-content">
                <div className="page-header">
                    <h1>🌾 {t('crops.title')}</h1>
                    <p>{t('crops.subtitle')}</p>
                </div>

                {/* Method Selection */}
                <div className="method-selector">
                    <button
                        className={`method-btn ${uploadMethod === 'ai' ? 'active' : ''}`}
                        onClick={() => setUploadMethod('ai')}
                    >
                        🤖 {t('crops.saathiBased')}
                    </button>
                    <button
                        className={`method-btn ${uploadMethod === 'pdf' ? 'active' : ''}`}
                        onClick={() => setUploadMethod('pdf')}
                    >
                        📄 {t('crops.uploadPDF')}
                    </button>
                </div>

                {/* AI Method */}
                {uploadMethod === 'ai' && (
                    <div className="recommendation-card">
                        <h2>🤖 {t('crops.saathiRecommendations')}</h2>
                        <p>{t('crops.saathiDescription')}</p>

                        <div className="season-selector">
                            <label>{t('crops.selectSeason')}:</label>
                            <select value={season} onChange={(e) => setSeason(e.target.value)}>
                                <option value="">Auto-detect</option>
                                <option value="Kharif">Kharif (June-Oct)</option>
                                <option value="Rabi">Rabi (Nov-March)</option>
                                <option value="Zaid">Zaid (March-June)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleAIRecommendation}
                            disabled={loading}
                            className="action-btn"
                        >
                            {loading ? '🔄 Analyzing...' : '🚀 Get Recommendations'}
                        </button>
                    </div>
                )}

                {/* PDF Upload Method */}
                {uploadMethod === 'pdf' && (
                    <div className="recommendation-card">
                        <h2>📄 Upload Soil Test Report</h2>
                        <p>Upload your soil analysis PDF for detailed, personalized crop recommendations</p>

                        <div className="upload-area">
                            <input
                                type="file"
                                id="soil-pdf-input"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            <label htmlFor="soil-pdf-input" className="file-label">
                                <div className="upload-icon">📎</div>
                                <div className="upload-text">
                                    {selectedFile ? selectedFile.name : 'Click to choose PDF file'}
                                </div>
                                <div className="upload-hint">Max 10MB • PDF only</div>
                            </label>
                        </div>

                        <button
                            onClick={handlePDFUpload}
                            disabled={!selectedFile || uploading}
                            className="action-btn"
                        >
                            {uploading ? '🔄 Analyzing PDF...' : '🚀 Upload & Analyze'}
                        </button>
                    </div>
                )}

                {/* Results */}
                {recommendations && (
                    <div className="results-section">
                        <div className="results-header">
                            <h2>✨ Your Crop Recommendations</h2>
                            {recommendations.reportId && (
                                <span className="report-badge">Report: {recommendations.reportId}</span>
                            )}
                        </div>

                        {/* Soil Analysis (if from PDF) */}
                        {recommendations.soilAnalysis && (
                            <div className="soil-analysis">
                                <h3>🧪 Soil Analysis Summary</h3>
                                <div className="analysis-grid">
                                    <div className="analysis-item">
                                        <span className="label">pH Level</span>
                                        <span className="value">{recommendations.soilAnalysis.pH || 'N/A'}</span>
                                    </div>
                                    <div className="analysis-item">
                                        <span className="label">Nitrogen (N)</span>
                                        <span className="value">{recommendations.soilAnalysis.nitrogen || 'N/A'}</span>
                                    </div>
                                    <div className="analysis-item">
                                        <span className="label">Phosphorus (P)</span>
                                        <span className="value">{recommendations.soilAnalysis.phosphorus || 'N/A'}</span>
                                    </div>
                                    <div className="analysis-item">
                                        <span className="label">Potassium (K)</span>
                                        <span className="value">{recommendations.soilAnalysis.potassium || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Crop Recommendations */}
                        <div className="crops-section">
                            <h3>🌾 Recommended Crops</h3>
                            <div className="crops-grid">
                                {recommendations.cropRecommendations?.map((crop, index) => (
                                    <div key={index} className="crop-card">
                                        <div className="crop-rank">#{crop.rank || index + 1}</div>
                                        <div className="crop-header">
                                            <h4>{crop.cropName?.english || crop.name || 'Unknown Crop'}</h4>
                                            {crop.cropName?.hindi && (
                                                <span className="hindi-name">{crop.cropName.hindi}</span>
                                            )}
                                        </div>

                                        <div className="suitability-badge" data-level={crop.suitability || crop.climateResilience?.level}>
                                            {crop.suitability || crop.climateResilience?.level || 'recommended'}
                                        </div>

                                        {crop.reason && <p className="crop-reason">{crop.reason}</p>}

                                        <div className="crop-details">
                                            {crop.season && (
                                                <div className="detail-row">
                                                    <span className="icon">📅</span>
                                                    <span><strong>Season:</strong> {crop.season}</span>
                                                </div>
                                            )}
                                            {(crop.expectedYield || crop.yieldExpectation) && (
                                                <div className="detail-row">
                                                    <span className="icon">📈</span>
                                                    <span><strong>Yield:</strong> {displayYield(crop.expectedYield || crop.yieldExpectation)}</span>
                                                </div>
                                            )}
                                            {crop.waterRequirement && (
                                                <div className="detail-row">
                                                    <span className="icon">💧</span>
                                                    <span><strong>Water:</strong> {crop.waterRequirement}</span>
                                                </div>
                                            )}
                                            {crop.marketPrice && (
                                                <div className="detail-row">
                                                    <span className="icon">💰</span>
                                                    <span><strong>Price:</strong> {displayMarketPrice(crop.marketPrice)}</span>
                                                </div>
                                            )}
                                            {crop.duration && (
                                                <div className="detail-row">
                                                    <span className="icon">⏱️</span>
                                                    <span><strong>Duration:</strong> {typeof crop.duration === 'object' ? crop.duration.description : crop.duration}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Benefits */}
                                        {crop.benefits && crop.benefits.length > 0 && (
                                            <div className="crop-benefits">
                                                <strong>Benefits:</strong>
                                                <ul>
                                                    {crop.benefits.map((benefit, i) => (
                                                        <li key={i}>{benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fertilizer Plan (if from PDF) */}
                        {recommendations.fertilizerPlan && (
                            <div className="fertilizer-section">
                                <h3>💊 Fertilizer Recommendations</h3>
                                <div className="fertilizer-grid">
                                    {recommendations.fertilizerPlan.organic && (
                                        <div className="fertilizer-card">
                                            <h4>🌿 Organic</h4>
                                            <ul>
                                                {recommendations.fertilizerPlan.organic.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {recommendations.fertilizerPlan.chemical && (
                                        <div className="fertilizer-card">
                                            <h4>⚗️ Chemical</h4>
                                            <ul>
                                                {recommendations.fertilizerPlan.chemical.map((item, i) => (
                                                    <li key={i}>
                                                        {typeof item === 'object' ? `${item.name} - ${item.quantity}` : item}
                                                        {item.timing && <span className="timing">({item.timing})</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Soil Improvement Tips (if from PDF) */}
                        {recommendations.soilImprovement && (
                            <div className="improvement-section">
                                <h3>✨ Soil Improvement Tips</h3>
                                <ul className="improvement-list">
                                    {recommendations.soilImprovement.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CropRecommendation;
