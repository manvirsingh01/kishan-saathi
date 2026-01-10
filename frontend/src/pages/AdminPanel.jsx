import React from 'react';
import Navbar from '../components/Navbar';

function AdminPanel() {
    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem' }}>
                <h1>Admin Panel</h1>
                <p className="text-secondary mb-xl">Manage government information and system settings</p>
                <div className="card">
                    <p>Admin interface for managing government policies, MSP, and compensation schemes</p>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;
