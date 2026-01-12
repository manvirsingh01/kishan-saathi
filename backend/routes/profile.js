const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { FileUserModel, FileFarmModel } = require('../models/fileModels');

// @route   GET /api/profile
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await FileUserModel.getWithFarmDetails(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/profile
router.put('/', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password;
        delete updates.email;
        delete updates.role;

        await FileUserModel.update(req.user.id, updates);
        const user = await FileUserModel.getWithFarmDetails(req.user.id);

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Server error during profile update' });
    }
});

// @route   PUT /api/profile/location
router.put('/location', authMiddleware, async (req, res) => {
    try {
        const { coordinates, state, district, village, pincode } = req.body;

        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ error: 'Valid coordinates [longitude, latitude] required' });
        }

        const user = await FileUserModel.findById(req.user.id);
        if (!user || !user.activeFarmId) {
            return res.status(404).json({ error: 'User or active farm not found' });
        }

        await FileFarmModel.update(user.activeFarmId, {
            longitude: coordinates[0],
            latitude: coordinates[1],
            state, district, village, pincode
        });

        res.json({ message: 'Location updated successfully', location: { coordinates, state, district, village, pincode } });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ error: 'Server error during location update' });
    }
});

// @route   GET /api/profile/farms
router.get('/farms', authMiddleware, async (req, res) => {
    try {
        const user = await FileUserModel.findById(req.user.id);
        const farms = await FileFarmModel.findByUserId(req.user.id);
        res.json({ farms: farms || [], activeFarmId: user?.activeFarmId });
    } catch (error) {
        console.error('Farms fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/profile/farms
router.post('/farms', authMiddleware, async (req, res) => {
    try {
        const { name, location, landArea, landType, soilType, pincode, village, state, district, coordinates } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Farm name is required' });
        }

        const newFarm = await FileFarmModel.create({
            userId: req.user.id,
            name,
            pincode: pincode || location?.pincode || '',
            village: village || location?.village || '',
            state: state || location?.state || '',
            district: district || location?.district || '',
            latitude: coordinates?.[1] || location?.coordinates?.[1] || 0,
            longitude: coordinates?.[0] || location?.coordinates?.[0] || 0,
            landArea: landArea || 0,
            landType: landType || 'irrigated',
            soilType: soilType || 'alluvial',
            isActive: false
        });

        const user = await FileUserModel.findById(req.user.id);
        if (!user.activeFarmId) {
            await FileUserModel.update(req.user.id, { activeFarmId: newFarm.id });
        }

        const farms = await FileFarmModel.findByUserId(req.user.id);
        res.status(201).json({ message: 'Farm added successfully', farm: newFarm, farms, activeFarmId: user.activeFarmId || newFarm.id });
    } catch (error) {
        console.error('Farm creation error:', error);
        res.status(500).json({ error: 'Server error during farm creation' });
    }
});

// @route   PUT /api/profile/farms/:farmId
router.put('/farms/:farmId', authMiddleware, async (req, res) => {
    try {
        const { farmId } = req.params;
        const updates = req.body;
        delete updates.id;
        delete updates.userId;

        if (updates.location) {
            updates.state = updates.location.state || updates.state;
            updates.district = updates.location.district || updates.district;
            updates.village = updates.location.village || updates.village;
            updates.pincode = updates.location.pincode || updates.pincode;
            if (updates.location.coordinates) {
                updates.longitude = updates.location.coordinates[0];
                updates.latitude = updates.location.coordinates[1];
            }
            delete updates.location;
        }

        const updatedFarm = await FileFarmModel.update(farmId, updates);
        const farms = await FileFarmModel.findByUserId(req.user.id);
        res.json({ message: 'Farm updated successfully', farm: updatedFarm, farms });
    } catch (error) {
        console.error('Farm update error:', error);
        res.status(500).json({ error: 'Server error during farm update' });
    }
});

// @route   DELETE /api/profile/farms/:farmId
router.delete('/farms/:farmId', authMiddleware, async (req, res) => {
    try {
        const { farmId } = req.params;
        await FileFarmModel.delete(farmId);

        const user = await FileUserModel.findById(req.user.id);
        const farms = await FileFarmModel.findByUserId(req.user.id);

        let activeFarmId = user.activeFarmId;
        if (activeFarmId === farmId) {
            activeFarmId = farms.length > 0 ? farms[0].id : null;
            await FileUserModel.update(req.user.id, { activeFarmId });
        }

        res.json({ message: 'Farm deleted successfully', farms, activeFarmId });
    } catch (error) {
        console.error('Farm deletion error:', error);
        res.status(500).json({ error: 'Server error during farm deletion' });
    }
});

// @route   PUT /api/profile/farms/:farmId/activate
router.put('/farms/:farmId/activate', authMiddleware, async (req, res) => {
    try {
        const { farmId } = req.params;
        const farm = await FileFarmModel.setActiveFarm(req.user.id, farmId);
        if (!farm) {
            return res.status(404).json({ error: 'Farm not found' });
        }
        res.json({ message: 'Active farm updated', activeFarmId: farmId, activeFarm: farm });
    } catch (error) {
        console.error('Activate farm error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
