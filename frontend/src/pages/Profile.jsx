import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import { profileAPI } from '../utils/api';
import './Profile.css';

// Indian states and their districts
const INDIAN_STATES = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Haryana": ["Faridabad", "Gurgaon", "Rohtak", "Panipat", "Karnal"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Udaipur"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"]
};

const SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Desert", "Mountain", "Saline"];
const LAND_TYPES = ["Irrigated", "Rain-fed", "Dry land", "Wetland"];

function Profile() {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Farm management
    const [showAddFarm, setShowAddFarm] = useState(false);
    const [editingFarm, setEditingFarm] = useState(null);
    const [farmForm, setFarmForm] = useState({
        name: '',
        location: { state: '', district: '', village: '', pincode: '', coordinates: [77.2090, 28.6139] },
        landArea: 0,
        landType: '',
        soilType: ''
    });

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        language: 'en'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                language: user.language || 'en'
            });
        }

        // Check if we should open add farm modal
        if (searchParams.get('addFarm') === 'true') {
            setShowAddFarm(true);
        }
    }, [user, searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
        setSuccess('');
    };

    // State for pincode lookup
    const [lookingUpPincode, setLookingUpPincode] = useState(false);
    const pincodeTimeoutRef = useRef(null);

    // Lookup location by pincode using India Post API
    const lookupPincode = async (pincode) => {
        if (pincode.length !== 6) return;

        setLookingUpPincode(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
                const postOffice = data[0].PostOffice[0];

                // Get coordinates using geocoding
                let coordinates = [77.2090, 28.6139]; // Default
                try {
                    const geoResponse = await fetch(
                        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`
                    );
                    const geoData = await geoResponse.json();
                    if (geoData.length > 0) {
                        coordinates = [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
                    }
                } catch (e) {
                    console.log('Geocoding failed, using default');
                }

                setFarmForm(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        state: postOffice.State || prev.location.state,
                        district: postOffice.District || prev.location.district,
                        village: postOffice.Name || prev.location.village,
                        pincode: pincode,
                        coordinates: coordinates
                    }
                }));

                setSuccess(`📍 Location found: ${postOffice.Name}, ${postOffice.District}`);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            console.error('Pincode lookup failed:', error);
        } finally {
            setLookingUpPincode(false);
        }
    };

    const handleFarmFormChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            const field = name.split('.')[1];
            setFarmForm({
                ...farmForm,
                location: { ...farmForm.location, [field]: value }
            });

            // Debounced auto-lookup when pincode is 6 digits
            if (field === 'pincode') {
                // Clear any pending timeout
                if (pincodeTimeoutRef.current) {
                    clearTimeout(pincodeTimeoutRef.current);
                }
                // Only lookup if valid 6-digit pincode after 500ms delay
                if (value.length === 6 && /^\d{6}$/.test(value)) {
                    pincodeTimeoutRef.current = setTimeout(() => {
                        lookupPincode(value);
                    }, 500);
                }
            }
        } else {
            setFarmForm({ ...farmForm, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await profileAPI.updateProfile(formData);
            updateUser(response.data.user);
            setSuccess('Profile updated successfully! ✓');
            setEditMode(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFarm = async (e) => {
        e.preventDefault();
        if (!farmForm.name) {
            setError('Farm name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await profileAPI.addFarm(farmForm);
            const updatedUser = {
                ...user,
                farms: response.data.farms,
                activeFarmId: response.data.activeFarmId,
                farmDetails: response.data.farm
            };
            updateUser(updatedUser);
            setShowAddFarm(false);
            resetFarmForm();
            setSuccess('Farm added successfully! ✓');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add farm');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFarm = async (e) => {
        e.preventDefault();
        if (!editingFarm) return;

        setLoading(true);
        try {
            const response = await profileAPI.updateFarm(editingFarm.id, farmForm);
            const updatedUser = {
                ...user,
                farms: response.data.farms,
                farmDetails: user.activeFarmId === editingFarm.id ? response.data.farm : user.farmDetails
            };
            updateUser(updatedUser);
            setEditingFarm(null);
            resetFarmForm();
            setSuccess('Farm updated successfully! ✓');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update farm');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFarm = async (farmId) => {
        if (!window.confirm('Are you sure you want to delete this farm?')) return;

        setLoading(true);
        try {
            const response = await profileAPI.deleteFarm(farmId);
            const updatedUser = {
                ...user,
                farms: response.data.farms,
                activeFarmId: response.data.activeFarmId,
                farmDetails: response.data.farms.find(f => f.id === response.data.activeFarmId)
            };
            updateUser(updatedUser);
            setSuccess('Farm deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete farm');
        } finally {
            setLoading(false);
        }
    };

    const startEditFarm = (farm) => {
        setEditingFarm(farm);
        setFarmForm({
            name: farm.name || '',
            location: farm.location || { state: '', district: '', village: '', pincode: '', coordinates: [77.2090, 28.6139] },
            landArea: farm.landArea || 0,
            landType: farm.landType || '',
            soilType: farm.soilType || ''
        });
    };

    const resetFarmForm = () => {
        setFarmForm({
            name: '',
            location: { state: '', district: '', village: '', pincode: '', coordinates: [77.2090, 28.6139] },
            landArea: 0,
            landType: '',
            soilType: ''
        });
    };

    const getDistrictsForState = (state) => INDIAN_STATES[state] || [];

    // Render farm form modal JSX (not a component to avoid re-mounting)
    const renderFarmFormModal = (title, onSubmit, onCancel) => (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Farm Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={farmForm.name}
                            onChange={handleFarmFormChange}
                            className="form-input"
                            placeholder="e.g., North Field Farm"
                            required
                        />
                    </div>

                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">State</label>
                            <select
                                name="location.state"
                                value={farmForm.location.state}
                                onChange={handleFarmFormChange}
                                className="form-select"
                            >
                                <option value="">Select State</option>
                                {Object.keys(INDIAN_STATES).map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">District</label>
                            <select
                                name="location.district"
                                value={farmForm.location.district}
                                onChange={handleFarmFormChange}
                                className="form-select"
                                disabled={!farmForm.location.state}
                            >
                                <option value="">Select District</option>
                                {getDistrictsForState(farmForm.location.state).map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Village/Town</label>
                            <input
                                type="text"
                                name="location.village"
                                value={farmForm.location.village}
                                onChange={handleFarmFormChange}
                                className="form-input"
                                placeholder="Enter village name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Pincode {lookingUpPincode && <span className="loading-text">🔍 Looking up...</span>}
                            </label>
                            <input
                                type="text"
                                name="location.pincode"
                                value={farmForm.location.pincode}
                                onChange={handleFarmFormChange}
                                className={`form-input ${lookingUpPincode ? 'loading' : ''}`}
                                placeholder="Enter 6-digit pincode"
                                maxLength="6"
                            />
                            <small className="text-secondary">Auto-fills location on 6 digits</small>
                        </div>
                    </div>

                    {/* Location Preview */}
                    {farmForm.location.coordinates && farmForm.location.coordinates[0] !== 77.2090 && (
                        <div className="location-preview">
                            <p>📍 <strong>Coordinates:</strong> {farmForm.location.coordinates[1]?.toFixed(4)}, {farmForm.location.coordinates[0]?.toFixed(4)}</p>
                        </div>
                    )}

                    <div className="grid grid-3">
                        <div className="form-group">
                            <label className="form-label">Land Area (ha)</label>
                            <input
                                type="number"
                                name="landArea"
                                value={farmForm.landArea}
                                onChange={handleFarmFormChange}
                                className="form-input"
                                min="0"
                                step="0.1"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Soil Type</label>
                            <select
                                name="soilType"
                                value={farmForm.soilType}
                                onChange={handleFarmFormChange}
                                className="form-select"
                            >
                                <option value="">Select</option>
                                {SOIL_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Land Type</label>
                            <select
                                name="landType"
                                value={farmForm.landType}
                                onChange={handleFarmFormChange}
                                className="form-select"
                            >
                                <option value="">Select</option>
                                {LAND_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : '💾 Save Farm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="profile-page">
            <Navbar />

            <div className="container profile-container">
                {/* Header */}
                <div className="profile-header">
                    <div>
                        <h1>👨‍🌾 {t('nav.profile')}</h1>
                        <p className="text-secondary">Manage your profile and farms</p>
                    </div>
                    {!editMode && (
                        <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                {/* Messages */}
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                {/* Farms Section */}
                <div className="profile-section farms-section">
                    <div className="section-header">
                        <h2>🌾 My Farms</h2>
                        <button className="btn btn-success" onClick={() => setShowAddFarm(true)}>
                            ➕ Add Farm
                        </button>
                    </div>

                    <div className="farms-grid">
                        {user?.farms?.map(farm => (
                            <div key={farm.id} className={`farm-card ${farm.id === user.activeFarmId ? 'active' : ''}`}>
                                {farm.id === user.activeFarmId && (
                                    <span className="active-farm-badge">Active</span>
                                )}
                                <h3>{farm.name}</h3>
                                <p className="farm-location-text">
                                    📍 {farm.location?.district || 'Unknown'}, {farm.location?.state || 'Unknown'}
                                </p>
                                <div className="farm-stats">
                                    <span>📏 {farm.landArea || 0} ha</span>
                                    <span>🌱 {farm.soilType || 'N/A'}</span>
                                    <span>💧 {farm.landType || 'N/A'}</span>
                                </div>
                                <div className="farm-actions">
                                    <button className="btn btn-sm btn-secondary" onClick={() => startEditFarm(farm)}>
                                        ✏️ Edit
                                    </button>
                                    {user.farms.length > 1 && (
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFarm(farm.id)}>
                                            🗑️ Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Personal Information */}
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="profile-section">
                        <h2>👤 Personal Information</h2>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={!editMode}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    className="form-input"
                                    disabled
                                    style={{ opacity: 0.7 }}
                                />
                                <small className="text-secondary">Email cannot be changed</small>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={!editMode}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Preferred Language</label>
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!editMode}
                                >
                                    <option value="en">English</option>
                                    <option value="hi">हिंदी (Hindi)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {editMode && (
                        <div className="profile-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setEditMode(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : '💾 Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Add Farm Modal */}
            {showAddFarm && renderFarmFormModal(
                "➕ Add New Farm",
                handleAddFarm,
                () => { setShowAddFarm(false); resetFarmForm(); }
            )}

            {/* Edit Farm Modal */}
            {editingFarm && renderFarmFormModal(
                `✏️ Edit ${editingFarm.name}`,
                handleUpdateFarm,
                () => { setEditingFarm(null); resetFarmForm(); }
            )}
        </div>
    );
}

export default Profile;
