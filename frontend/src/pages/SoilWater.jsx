import React from 'react';
import Navbar from '../components/Navbar';

function SoilWater() {
    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem' }}>
                <h1>Soil & Water Sustainability</h1>
                <p className="text-secondary mb-xl">Assessments of soil fertility and groundwater availability</p>
                <div className="card">
                    <p>Soil fertility status, groundwater availability, and irrigation dependency analysis</p>
                </div>
            </div>
        </div>
    );
}

export default SoilWater;
