import React from 'react';
import './RiskIndicator.css';

function RiskIndicator({ level, label }) {
    const getLevelClass = () => {
        switch (level?.toLowerCase()) {
            case 'low':
            case 'adequate':
            case 'normal':
                return 'risk-indicator-low';
            case 'medium':
            case 'moderate':
            case 'irregular':
                return 'risk-indicator-medium';
            case 'high':
            case 'severe':
            case 'highly-irregular':
                return 'risk-indicator-high';
            case 'extreme':
            case 'critical':
                return 'risk-indicator-extreme';
            default:
                return 'risk-indicator-medium';
        }
    };

    const getLevelText = () => {
        if (!level) return 'Unknown';
        return level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ');
    };

    return (
        <div className={`risk-indicator ${getLevelClass()}`}>
            {label && <span className="risk-label">{label}:</span>}
            <span className="risk-value">{getLevelText()}</span>
        </div>
    );
}

export default RiskIndicator;
