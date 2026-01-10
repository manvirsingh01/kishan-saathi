import React from 'react';
import Navbar from '../components/Navbar';

function LossReport() {
    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem' }}>
                <h1>Climate Loss Report</h1>
                <p className="text-secondary mb-xl">Document invisible yield losses for insurance and compensation</p>
                <div className="card">
                    <p>Create and manage climate loss reports with PDF generation for insurance claims</p>
                </div>
            </div>
        </div>
    );
}

export default LossReport;
