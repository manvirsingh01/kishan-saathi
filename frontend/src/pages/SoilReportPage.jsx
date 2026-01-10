import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import './SoilReportPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function SoilReportPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/soil-reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data.reports);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
        } else {
            alert('Please select a PDF file');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a PDF file first');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('soilReport', selectedFile);
            formData.append('notes', notes);

            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/soil-reports/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Soil report uploaded and analyzed successfully!');
            setSelectedFile(null);
            setNotes('');
            setSelectedReport(response.data.report);
            fetchReports();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload soil report: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const viewReport = async (reportId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/soil-reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedReport(response.data.report);
        } catch (error) {
            console.error('Failed to fetch report details:', error);
        }
    };

    return (
        <div className="soil-report-page">
            <Navbar />

            <div className="page-content">
                <div className="page-header">
                    <h1>🌱 Soil Report Analysis</h1>
                    <p>Upload your soil test report and get Saathi-powered crop recommendations</p>
                </div>

                {/* Upload Section */}
                <div className="upload-section">
                    <div className="upload-card">
                        <div className="upload-icon">📄</div>
                        <h2>Upload Soil Test Report</h2>
                        <p>Upload a PDF of your soil analysis report for personalized recommendations</p>

                        <div className="upload-controls">
                            <input
                                type="file"
                                id="soil-pdf"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            <label htmlFor="soil-pdf" className="file-label">
                                {selectedFile ? selectedFile.name : '📎 Choose PDF File'}
                            </label>

                            <textarea
                                placeholder="Add notes (optional)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="notes-input"
                                rows="3"
                            />

                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="upload-btn"
                            >
                                {uploading ? '🔄 Analyzing...' : '🚀 Upload & Analyze'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analysis Results */}
                {selectedReport && (
                    <div className="analysis-results">
                        <div className="results-header">
                            <h2>📊 Analysis Results</h2>
                            <span className="report-id">{selectedReport.reportId}</span>
                        </div>

                        {/* Soil Analysis */}
                        <div className="result-section">
                            <h3>🧪 Soil Analysis</h3>
                            <div className="soil-stats">
                                <div className="stat-card">
                                    <span className="stat-label">pH Level</span>
                                    <span className="stat-value">{selectedReport.soilAnalysis?.pH || 'N/A'}</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Nitrogen</span>
                                    <span className="stat-value">{selectedReport.soilAnalysis?.nitrogen || 'N/A'}</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Phosphorus</span>
                                    <span className="stat-value">{selectedReport.soilAnalysis?.phosphorus || 'N/A'}</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Potassium</span>
                                    <span className="stat-value">{selectedReport.soilAnalysis?.potassium || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Crop Recommendations */}
                        <div className="result-section">
                            <h3>🌾 Recommended Crops</h3>
                            <div className="crops-grid">
                                {selectedReport.cropRecommendations?.map((crop, index) => (
                                    <div key={index} className="crop-card">
                                        <div className="crop-header">
                                            <h4>{crop.cropName?.english}</h4>
                                            <span className="hindi-name">{crop.cropName?.hindi}</span>
                                        </div>
                                        <div className="crop-badge">{crop.suitability}</div>
                                        <p className="crop-reason">{crop.reason}</p>
                                        <div className="crop-details">
                                            <div><strong>Season:</strong> {crop.season}</div>
                                            <div><strong>Yield:</strong> {crop.expectedYield}</div>
                                            <div><strong>Water:</strong> {crop.waterRequirement}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fertilizer Plan */}
                        {selectedReport.fertilizerPlan && (
                            <div className="result-section">
                                <h3>💊 Fertilizer Recommendations</h3>
                                <div className="fertilizer-plan">
                                    {selectedReport.fertilizerPlan.organic && (
                                        <div>
                                            <strong>Organic:</strong>
                                            <ul>
                                                {selectedReport.fertilizerPlan.organic.map((f, i) => <li key={i}>{f}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {selectedReport.fertilizerPlan.chemical && (
                                        <div>
                                            <strong>Chemical:</strong>
                                            <ul>
                                                {selectedReport.fertilizerPlan.chemical.map((f, i) => (
                                                    <li key={i}>{f.name} - {f.quantity} ({f.timing})</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Soil Improvement */}
                        {selectedReport.soilImprovement && (
                            <div className="result-section">
                                <h3>✨ Soil Improvement Tips</h3>
                                <ul className="improvement-list">
                                    {selectedReport.soilImprovement.map((tip, i) => <li key={i}>{tip}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Previous Reports */}
                <div className="previous-reports">
                    <h2>📚 Previous Reports</h2>
                    {loading ? (
                        <LoadingSpinner />
                    ) : reports.length === 0 ? (
                        <p className="no-reports">No reports uploaded yet</p>
                    ) : (
                        <div className="reports-list">
                            {reports.map(report => (
                                <div key={report.id} className="report-item" onClick={() => viewReport(report.id)}>
                                    <div className="report-icon">📄</div>
                                    <div className="report-info">
                                        <h4>{report.fileName}</h4>
                                        <p>{new Date(report.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`status-badge ${report.status}`}>{report.status}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SoilReportPage;
