import React from 'react';
import Navbar from '../components/Navbar';

function Analytics() {
    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem' }}>
                <h1>Advanced Analytics</h1>
                <p className="text-secondary mb-xl">Climate trends, yield loss estimation, and historical analysis</p>
                <div className="card">
                    <p>View climate stress graphs, yield drop estimation, and price of yield loss trends</p>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
