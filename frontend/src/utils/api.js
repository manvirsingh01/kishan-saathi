import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    verify: () => api.get('/auth/verify')
};

// Profile APIs
export const profileAPI = {
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    updateLocation: (location) => api.put('/profile/location', location)
};

// Climate APIs
export const climateAPI = {
    getStress: (params = '') => api.get(`/climate/stress${params}`),
    getRisk: () => api.get('/climate/risk'),
    getHistory: (limit = 30) => api.get(`/climate/history?limit=${limit}`)
};

// Soil APIs
export const soilAPI = {
    getSustainability: () => api.get('/soil/sustainability')
};

// Crop APIs
export const cropAPI = {
    getRecommendations: (data) => api.post('/crops/recommend', data),
    getHistory: (limit = 10) => api.get(`/crops/history?limit=${limit}`),
    getRecommendation: (id) => api.get(`/crops/recommendation/${id}`)
};

// Reports APIs
export const reportsAPI = {
    createLossReport: (data) => api.post('/reports/loss', data),
    getLossReports: () => api.get('/reports/loss'),
    getLossReport: (id) => api.get(`/reports/loss/${id}`),
    updateLossReport: (id, data) => api.put(`/reports/loss/${id}`, data),
    downloadPDF: (id) => api.get(`/reports/pdf/${id}`, { responseType: 'blob' })
};

// Analytics APIs
export const analyticsAPI = {
    getClimateAnalytics: (days = 30) => api.get(`/analytics/climate?days=${days}`),
    getYieldAnalytics: () => api.get('/analytics/yield'),
    getSummary: () => api.get('/analytics/summary')
};

// Government APIs
export const governmentAPI = {
    getInfo: (category, state) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (state) params.append('state', state);
        return api.get(`/government/info?${params.toString()}`);
    },
    getInfoDetail: (id) => api.get(`/government/info/${id}`),
    getCategories: () => api.get('/government/categories'),
    // Admin routes
    createInfo: (data) => api.post('/government/admin', data),
    updateInfo: (id, data) => api.put(`/government/admin/${id}`, data),
    deleteInfo: (id) => api.delete(`/government/admin/${id}`),
    getAllInfo: () => api.get('/government/admin/all')
};

export default api;
