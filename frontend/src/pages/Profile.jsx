import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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
    const { user, login } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        language: 'en',
        farmDetails: {
            location: {
                state: '',
                district: '',
                village: '',
                pincode: '',
                coordinates: [77.2090, 28.6139]
            },
            landArea: 0,
            landType: '',
            soilType: '',
            waterSource: [],
            currentCrops: []
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                language: user.language || 'en',
                farmDetails: {
                    location: {
                        state: user.farmDetails?.location?.state || '',
                        district: user.farmDetails?.location?.district || '',
                        village: user.farmDetails?.location?.village || '',
                        pincode: user.farmDetails?.location?.pincode || '',
                        coordinates: user.farmDetails?.location?.coordinates || [77.2090, 28.6139]
                    },
                    landArea: user.farmDetails?.landArea || 0,
                    landType: user.farmDetails?.landType || '',
                    soilType: user.farmDetails?.soilType || '',
                    waterSource: user.farmDetails?.waterSource || [],
                    currentCrops: user.farmDetails?.currentCrops || []
                }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('farmDetails.location.')) {
            const field = name.split('.')[2];
            setFormData({
                ...formData,
                farmDetails: {
                    ...formData.farmDetails,
                    location: {
                        ...formData.farmDetails.location,
                        [field]: value
                    }
                }
            });
        } else if (name.startsWith('farmDetails.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                farmDetails: {
                    ...formData.farmDetails,
                    [field]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/profile`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update user context with new data
            login(response.data.user, token);

            setSuccess('Profile updated successfully! ✓');
            setEditMode(false);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original user data
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                language: user.language || 'en',
                farmDetails: {
                    location: {
                        state: user.farmDetails?.location?.state || '',
                        district: user.farmDetails?.location?.district || '',
                        village: user.farmDetails?.location?.village || '',
                        pincode: user.farmDetails?.location?.pincode || '',
                        coordinates: user.farmDetails?.location?.coordinates || [77.2090, 28.6139]
                    },
                    landArea: user.farmDetails?.landArea || 0,
                    landType: user.farmDetails?.landType || '',
                    soilType: user.farmDetails?.soilType || '',
                    waterSource: user.farmDetails?.waterSource || [],
                    currentCrops: user.farmDetails?.currentCrops || []
                }
            });
        }
        setEditMode(false);
        setError('');
        setSuccess('');
    };

    const getDistrictsForState = (state) => {
        return INDIAN_STATES[state] || [];
    };

    return (
        <div className="profile-page">
            <Navbar />

            <div className="container profile-container">
                {/* Header */}
                <div className="profile-header">
                    <div>
                        <h1>👨‍🌾 {t('nav.profile')}</h1>
                        <p className="text-secondary">Manage your farm details and location settings</p>
                    </div>
                    {!editMode && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setEditMode(true)}
                        >
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="profile-form">
                    {/* Personal Information */}
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
                                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
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

                    {/* Farm Location */}
                    <div className="profile-section">
                        <h2>📍 Farm Location</h2>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">State *</label>
                                <select
                                    name="farmDetails.location.state"
                                    value={formData.farmDetails.location.state}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!editMode}
                                    required
                                >
                                    <option value="">Select State</option>
                                    {Object.keys(INDIAN_STATES).map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">District *</label>
                                <select
                                    name="farmDetails.location.district"
                                    value={formData.farmDetails.location.district}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!editMode || !formData.farmDetails.location.state}
                                    required
                                >
                                    <option value="">Select District</option>
                                    {getDistrictsForState(formData.farmDetails.location.state).map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Village/Town</label>
                                <input
                                    type="text"
                                    name="farmDetails.location.village"
                                    value={formData.farmDetails.location.village}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={!editMode}
                                    placeholder="Enter village or town name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input
                                    type="text"
                                    name="farmDetails.location.pincode"
                                    value={formData.farmDetails.location.pincode}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={!editMode}
                                    placeholder="Enter 6-digit pincode"
                                    pattern="[0-9]{6}"
                                    maxLength="6"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Farm Details */}
                    <div className="profile-section">
                        <h2>🌾 Farm Details</h2>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Land Area (hectares) *</label>
                                <input
                                    type="number"
                                    name="farmDetails.landArea"
                                    value={formData.farmDetails.landArea}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={!editMode}
                                    min="0"
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Soil Type *</label>
                                <select
                                    name="farmDetails.soilType"
                                    value={formData.farmDetails.soilType}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!editMode}
                                    required
                                >
                                    <option value="">Select Soil Type</option>
                                    {SOIL_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Land Type *</label>
                                <select
                                    name="farmDetails.landType"
                                    value={formData.farmDetails.landType}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!editMode}
                                    required
                                >
                                    <option value="">Select Land Type</option>
                                    {LAND_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {editMode && (
                        <div className="profile-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : '💾 Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default Profile;
