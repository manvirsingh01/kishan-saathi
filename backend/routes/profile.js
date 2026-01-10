const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/profile
// @desc    Get farmer profile
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({ user });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/profile
// @desc    Update farmer profile
// @access  Private
router.put('/', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;

        // Fields that can be updated
        const allowedUpdates = [
            'name', 'phone', 'language',
            'farmDetails.location', 'farmDetails.landArea', 'farmDetails.landType',
            'farmDetails.soilType', 'farmDetails.waterSource', 'farmDetails.currentCrops'
        ];

        // Don't allow password updates through this route
        delete updates.password;
        delete updates.email;
        delete updates.role;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update(updates);

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Server error during profile update' });
    }
});

// @route   PUT /api/profile/location
// @desc    Update farm location
// @access  Private
router.put('/location', authMiddleware, async (req, res) => {
    try {
        const { coordinates, state, district, village, pincode } = req.body;

        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ error: 'Valid coordinates [longitude, latitude] required' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update farmDetails with new location
        const updatedFarmDetails = {
            ...user.farmDetails,
            location: {
                type: 'Point',
                coordinates,
                state,
                district,
                village,
                pincode
            }
        };

        await user.update({ farmDetails: updatedFarmDetails });

        res.json({
            message: 'Location updated successfully',
            location: updatedFarmDetails.location // Use updatedFarmDetails.location for the response
        });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ error: 'Server error during location update' });
    }
});

module.exports = router;
