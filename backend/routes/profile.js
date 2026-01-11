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
// @desc    Update location for active farm
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

        // Update active farm's location
        const farms = [...(user.farms || [])];
        const activeFarmIndex = farms.findIndex(f => f.id === user.activeFarmId);

        if (activeFarmIndex >= 0) {
            farms[activeFarmIndex] = {
                ...farms[activeFarmIndex],
                location: {
                    type: 'Point',
                    coordinates,
                    state,
                    district,
                    village,
                    pincode
                }
            };
            await user.update({ farms });
        }

        res.json({
            message: 'Location updated successfully',
            location: farms[activeFarmIndex]?.location
        });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ error: 'Server error during location update' });
    }
});

// @route   GET /api/profile/farms
// @desc    Get all farms for user
// @access  Private
router.get('/farms', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            farms: user.farms || [],
            activeFarmId: user.activeFarmId
        });
    } catch (error) {
        console.error('Farms fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/profile/farms
// @desc    Add a new farm
// @access  Private
router.post('/farms', authMiddleware, async (req, res) => {
    try {
        const { name, location, landArea, landType, soilType, waterSource, currentCrops } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Farm name is required' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const farmId = `farm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newFarm = {
            id: farmId,
            name,
            location: location || {
                type: 'Point',
                coordinates: [77.2090, 28.6139],
                state: '',
                district: '',
                village: '',
                pincode: ''
            },
            landArea: landArea || 0,
            landType: landType || '',
            soilType: soilType || '',
            waterSource: waterSource || [],
            currentCrops: currentCrops || []
        };

        const farms = [...(user.farms || []), newFarm];

        // If this is the first farm, set it as active
        const activeFarmId = user.activeFarmId || farmId;

        await user.update({ farms, activeFarmId });

        res.status(201).json({
            message: 'Farm added successfully',
            farm: newFarm,
            farms,
            activeFarmId
        });
    } catch (error) {
        console.error('Farm creation error:', error);
        res.status(500).json({ error: 'Server error during farm creation' });
    }
});

// @route   PUT /api/profile/farms/:farmId
// @desc    Update a specific farm
// @access  Private
router.put('/farms/:farmId', authMiddleware, async (req, res) => {
    try {
        const { farmId } = req.params;
        const updates = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const farms = [...(user.farms || [])];
        const farmIndex = farms.findIndex(f => f.id === farmId);

        if (farmIndex === -1) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        // Don't allow changing farm ID
        delete updates.id;

        farms[farmIndex] = {
            ...farms[farmIndex],
            ...updates
        };

        await user.update({ farms });

        res.json({
            message: 'Farm updated successfully',
            farm: farms[farmIndex],
            farms
        });
    } catch (error) {
        console.error('Farm update error:', error);
        res.status(500).json({ error: 'Server error during farm update' });
    }
});

// @route   DELETE /api/profile/farms/:farmId
// @desc    Delete a farm
// @access  Private
router.delete('/farms/:farmId', authMiddleware, async (req, res) => {
    try {
        const { farmId } = req.params;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const farms = (user.farms || []).filter(f => f.id !== farmId);

        if (farms.length === user.farms?.length) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        // If deleted farm was active, switch to first remaining farm
        let activeFarmId = user.activeFarmId;
        if (activeFarmId === farmId) {
            activeFarmId = farms.length > 0 ? farms[0].id : null;
        }

        await user.update({ farms, activeFarmId });

        res.json({
            message: 'Farm deleted successfully',
            farms,
            activeFarmId
        });
    } catch (error) {
        console.error('Farm deletion error:', error);
        res.status(500).json({ error: 'Server error during farm deletion' });
    }
});

// @route   PUT /api/profile/farms/:farmId/activate
// @desc    Set a farm as active
// @access  Private
router.put('/farms/:farmId/activate', authMiddleware, async (req, res) => {
    try {
        const { farmId } = req.params;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const farm = (user.farms || []).find(f => f.id === farmId);
        if (!farm) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        await user.update({ activeFarmId: farmId });

        res.json({
            message: 'Active farm updated',
            activeFarmId: farmId,
            activeFarm: farm
        });
    } catch (error) {
        console.error('Activate farm error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
