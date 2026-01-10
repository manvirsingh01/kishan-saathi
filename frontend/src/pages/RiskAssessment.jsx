import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import RiskIndicator from '../components/RiskIndicator';
import { climateAPI } from '../utils/api';

function RiskAssessment() {
    const [loading, setLoading] = useState(false);
    const [riskData, setRiskData] = useState(null);

    useEffect(() => {
        fetchRiskData();
    }, []);

    const fetchRiskData = async () => {
        setLoading(true);
        try {
            const response = await climateAPI.getRisk();
            setRiskData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                <h1>Flood & Drought Risk Assessment</h1>
                <p className="text-secondary mb-xl">Probability analysis for climate-related risks</p>

                {loading ? <LoadingSpinner /> : riskData ? (
                    <div className="grid grid-2 gap-xl">
                        <div className="card">
                            <h3 className="mb-md">🌊 Flood Risk</h3>
                            <RiskIndicator level={riskData.riskAssessment.floodRisk.level} />
                            <p className="mt-md"><strong>Probability:</strong> {riskData.riskAssessment.floodRisk.probability}%</p>
                            <div className="mt-md">
                                <p className="font-semibold mb-sm">Contributing Factors:</p>
                                <ul style={{ paddingLeft: '1.25rem' }}>
                                    {riskData.riskAssessment.floodRisk.factors.map((factor, i) => (
                                        <li key={i} className="text-sm">{factor}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="mb-md">☀️ Drought Risk</h3>
                            <RiskIndicator level={riskData.riskAssessment.droughtRisk.level} />
                            <p className="mt-md"><strong>Probability:</strong> {riskData.riskAssessment.droughtRisk.probability}%</p>
                            <div className="mt-md">
                                <p className="font-semibold mb-sm">Contributing Factors:</p>
                                <ul style={{ paddingLeft: '1.25rem' }}>
                                    {riskData.riskAssessment.droughtRisk.factors.map((factor, i) => (
                                        <li key={i} className="text-sm">{factor}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default RiskAssessment;
