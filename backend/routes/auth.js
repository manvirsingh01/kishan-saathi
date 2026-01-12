const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Use File-based models
const { FileUserModel } = require('../models/fileModels');

// @route   POST /api/auth/register
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phone, farmDetails } = req.body;

        const user = await FileUserModel.create({
            name,
            email: email.toLowerCase(),
            password,
            phone,
            farmDetails
        });

        const userWithFarms = await FileUserModel.getWithFarmDetails(user.id);

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'kishan_saathi_secret_key',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: userWithFarms
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.message === 'Email already registered') {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        res.status(500).json({ error: 'Server error during registration: ' + error.message });
    }
});

// @route   POST /api/auth/login
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await FileUserModel.findByEmail(email.toLowerCase());
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await FileUserModel.validatePassword(user, password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const userWithFarms = await FileUserModel.getWithFarmDetails(user.id);

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'kishan_saathi_secret_key',
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: userWithFarms
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login: ' + error.message });
    }
});

// @route   GET /api/auth/verify
router.get('/verify', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kishan_saathi_secret_key');
        const user = await FileUserModel.getWithFarmDetails(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(401).json({ error: 'Token is not valid' });
    }
});

module.exports = router;
