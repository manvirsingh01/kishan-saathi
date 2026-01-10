import React from 'react';
import Navbar from '../components/Navbar';

function Government() {
    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem' }}>
                <h1>Government Information</h1>
                <p className="text-secondary mb-xl">Policies, MSP, compensation schemes, and subsidies</p>
                <div className="card">
                    <p>Access government policies, Minimum Support Prices, compensation schemes, and subsidy information</p>
                </div>
            </div>
        </div>
    );
}

export default Government;
