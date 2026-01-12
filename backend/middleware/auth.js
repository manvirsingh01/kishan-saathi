const jwt = require('jsonwebtoken');
const { FileUserModel } = require('../models/fileModels');

/**
 * Authentication middleware using file-based models
 */
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kishan_saathi_secret_key');
        const user = await FileUserModel.getWithFarmDetails(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found, token invalid' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

/**
 * Admin middleware
 */
const adminMiddleware = async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
