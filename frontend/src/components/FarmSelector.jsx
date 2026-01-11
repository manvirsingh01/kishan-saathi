import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { profileAPI } from '../utils/api';
import './FarmSelector.css';

function FarmSelector() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!user || !user.farms || user.farms.length === 0) {
        return null;
    }

    const activeFarm = user.farms.find(f => f.id === user.activeFarmId) || user.farms[0];

    const handleFarmSwitch = async (farmId) => {
        if (farmId === user.activeFarmId) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const response = await profileAPI.activateFarm(farmId);

            // Update user context with new active farm
            const updatedUser = {
                ...user,
                activeFarmId: farmId,
                farmDetails: user.farms.find(f => f.id === farmId)
            };
            updateUser(updatedUser);

            setIsOpen(false);
            // Reload page to refresh all data for new farm
            window.location.reload();
        } catch (error) {
            console.error('Failed to switch farm:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFarm = () => {
        setIsOpen(false);
        navigate('/profile?addFarm=true');
    };

    return (
        <div className="farm-selector-bar">
            <div className="container">
                <div className="farm-selector-content">
                    <span className="farm-selector-label">🌾 Current Farm:</span>

                    <div className="farm-dropdown-container">
                        <button
                            className="farm-dropdown-trigger"
                            onClick={() => setIsOpen(!isOpen)}
                            disabled={loading}
                        >
                            <span className="farm-name">{activeFarm.name}</span>
                            <span className="farm-location">
                                {activeFarm.location?.district || activeFarm.location?.state || 'No location'}
                            </span>
                            <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                        </button>

                        {isOpen && (
                            <div className="farm-dropdown-menu">
                                {user.farms.map(farm => (
                                    <button
                                        key={farm.id}
                                        className={`farm-dropdown-item ${farm.id === user.activeFarmId ? 'active' : ''}`}
                                        onClick={() => handleFarmSwitch(farm.id)}
                                    >
                                        <div className="farm-item-info">
                                            <span className="farm-item-name">{farm.name}</span>
                                            <span className="farm-item-location">
                                                {farm.location?.district}, {farm.location?.state}
                                            </span>
                                        </div>
                                        <span className="farm-item-area">{farm.landArea} ha</span>
                                        {farm.id === user.activeFarmId && <span className="active-badge">✓</span>}
                                    </button>
                                ))}

                                <div className="dropdown-divider"></div>

                                <button className="farm-dropdown-item add-farm" onClick={handleAddFarm}>
                                    <span className="add-icon">➕</span>
                                    <span>Add New Farm</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <button className="add-farm-btn" onClick={handleAddFarm} title="Add New Farm">
                        ➕
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FarmSelector;
