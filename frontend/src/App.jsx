import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './utils/api';

// Context
export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Lazy load components
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ClimateStress = React.lazy(() => import('./pages/ClimateStress'));
const RiskAssessment = React.lazy(() => import('./pages/RiskAssessment'));
const SoilWater = React.lazy(() => import('./pages/SoilWater'));
const CropRecommendation = React.lazy(() => import('./pages/CropRecommendation'));
const LossReport = React.lazy(() => import('./pages/LossReport'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Government = React.lazy(() => import('./pages/GovernmentInfo'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            <Router>
                <React.Suspense fallback={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh'
                    }}>
                        <div className="spinner"></div>
                    </div>
                }>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={
                            user ? <Navigate to="/dashboard" replace /> : <Login />
                        } />
                        <Route path="/register" element={
                            user ? <Navigate to="/dashboard" replace /> : <Register />
                        } />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            user ? <Dashboard /> : <Navigate to="/login" replace />
                        } />
                        <Route path="/profile" element={
                            user ? <Profile /> : <Navigate to="/login" replace />
                        } />
                        <Route path="/climate-stress" element={
                            user ? <ClimateStress /> : <Navigate to="/login" replace />
                        } />
                        <Route path="/risk-assessment" element={
                            user ? <RiskAssessment /> : <Navigate to="/login" replace />
                        } />
                        <Route path="/soil-water" element={
                            user ? <SoilWater /> : <Navigate to="/login" replace />
                        } />
                        <Route path="/crop-recommendation" element={
                            user ? <CropRecommendation /> : <Navigate to="/login" replace />
                        } />
                        <Route path="/loss-report" element={
                            user ? <LossReport /> : <Navigate to="/login" replace />
                        } />
                        <Route path="/analytics" element={
                            user ? <Analytics /> : <Navigate to="/login" replace />
                        } />
                        <Route path="/government" element={
                            user ? <Government /> : <Navigate to="/login" replace />
                        } />

                        {/* Admin Route */}
                        <Route path="/admin" element={
                            user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" replace />
                        } />

                        {/* Default redirect */}
                        <Route path="/" element={
                            <Navigate to={user ? "/dashboard" : "/login"} replace />
                        } />

                        {/* 404 */}
                        <Route path="*" element={
                            <Navigate to={user ? "/dashboard" : "/login"} replace />
                        } />
                    </Routes>
                </React.Suspense>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
