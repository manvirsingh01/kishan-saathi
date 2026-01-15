const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// File paths
const usersFilePath = path.join(__dirname, '../data/users.json');
const farmsFilePath = path.join(__dirname, '../data/farms.json');

// Helper to save data
function saveUsers() {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(usersCache, null, 4));
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

function saveFarms() {
    try {
        fs.writeFileSync(farmsFilePath, JSON.stringify(farmsCache, null, 4));
    } catch (error) {
        console.error('Error saving farms:', error);
    }
}

// Load initial data from JSON files
let usersCache = [];
let farmsCache = [];

try {
    if (fs.existsSync(usersFilePath)) {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        usersCache = JSON.parse(data);
    } else {
        // Fallback to JS module if JSON doesn't exist
        usersCache = require('../data/users');
        saveUsers(); // Create the JSON file
    }
} catch (error) {
    console.error('Error loading users:', error);
    usersCache = [];
}

try {
    if (fs.existsSync(farmsFilePath)) {
        const data = fs.readFileSync(farmsFilePath, 'utf8');
        farmsCache = JSON.parse(data);
    } else {
        // Fallback to JS module if JSON doesn't exist
        farmsCache = require('../data/farms');
        saveFarms(); // Create the JSON file
    }
} catch (error) {
    console.error('Error loading farms:', error);
    farmsCache = [];
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * User Model - In-Memory (initialized from file)
 */
const FileUserModel = {
    async findByEmail(email) {
        return usersCache.find(u => u.email === email.toLowerCase()) || null;
    },

    async findById(id) {
        return usersCache.find(u => u.id === id) || null;
    },

    async create(userData) {
        // Check if email exists
        const existing = usersCache.find(u => u.email === userData.email.toLowerCase());
        if (existing) {
            throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const id = generateId();
        const now = new Date().toISOString();

        const newUser = {
            id,
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            phone: userData.phone || '',
            role: userData.role || 'farmer',
            activeFarmId: '',
            createdAt: now,
            updatedAt: now
        };

        usersCache.push(newUser);
        saveUsers();

        // Create initial farm if farmDetails provided
        if (userData.farmDetails) {
            const farm = await FileFarmModel.create({
                userId: id,
                name: 'My Farm',
                pincode: userData.farmDetails.location?.pincode || '',
                village: userData.farmDetails.location?.village || '',
                state: userData.farmDetails.location?.state || '',
                district: userData.farmDetails.location?.district || '',
                latitude: userData.farmDetails.location?.coordinates?.[1] || 0,
                longitude: userData.farmDetails.location?.coordinates?.[0] || 0,
                landArea: userData.farmDetails.landArea || 0,
                landType: userData.farmDetails.landType || 'irrigated',
                soilType: userData.farmDetails.soilType || 'alluvial',
                isActive: true
            });

            newUser.activeFarmId = farm.id;
        }

        return newUser;
    },

    async update(id, updateData) {
        const index = usersCache.findIndex(u => u.id === id);

        if (index === -1) {
            throw new Error('User not found');
        }

        // Update fields
        for (const [key, value] of Object.entries(updateData)) {
            if (key !== 'id' && key !== 'password') {
                usersCache[index][key] = value;
            }
        }
        usersCache[index].updatedAt = new Date().toISOString();
        saveUsers();

        return usersCache[index];
    },

    async validatePassword(user, password) {
        return bcrypt.compare(password, user.password);
    },

    async getWithFarmDetails(id) {
        const user = await this.findById(id);
        if (!user) return null;

        const rawFarms = await FileFarmModel.findByUserId(id);

        // Transform farms to include location object
        const farms = rawFarms.map(farm => ({
            id: farm.id,
            name: farm.name,
            location: {
                coordinates: [farm.longitude || 0, farm.latitude || 0],
                state: farm.state || '',
                district: farm.district || '',
                village: farm.village || '',
                pincode: farm.pincode || ''
            },
            landArea: farm.landArea || 0,
            landType: farm.landType || '',
            soilType: farm.soilType || ''
        }));

        const activeFarm = farms.find(f => f.id === user.activeFarmId) || farms[0];

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            farms: farms,
            activeFarmId: user.activeFarmId,
            farmDetails: activeFarm || null
        };
    }
};

/**
 * Farm Model - In-Memory (initialized from file)
 */
const FileFarmModel = {
    async findByUserId(userId) {
        return farmsCache.filter(f => f.userId === userId);
    },

    async findById(id) {
        return farmsCache.find(f => f.id === id) || null;
    },

    async create(farmData) {
        const id = generateId();
        const now = new Date().toISOString();

        const newFarm = {
            id,
            userId: farmData.userId,
            name: farmData.name || 'My Farm',
            pincode: farmData.pincode || '',
            village: farmData.village || '',
            state: farmData.state || '',
            district: farmData.district || '',
            latitude: farmData.latitude || 0,
            longitude: farmData.longitude || 0,
            landArea: farmData.landArea || 0,
            landType: farmData.landType || 'irrigated',
            soilType: farmData.soilType || 'alluvial',
            isActive: farmData.isActive || false,
            createdAt: now,
            updatedAt: now
        };

        farmsCache.push(newFarm);
        saveFarms();

        return {
            ...newFarm,
            location: {
                coordinates: [newFarm.longitude, newFarm.latitude],
                state: newFarm.state,
                district: newFarm.district,
                village: newFarm.village,
                pincode: newFarm.pincode
            }
        };
    },

    async update(id, updateData) {
        const index = farmsCache.findIndex(f => f.id === id);

        if (index === -1) {
            throw new Error('Farm not found');
        }

        for (const [key, value] of Object.entries(updateData)) {
            if (key !== 'id' && key !== 'userId') {
                farmsCache[index][key] = value;
            }
        }
        farmsCache[index].updatedAt = new Date().toISOString();
        saveFarms();
        return farmsCache[index];
    },

    async delete(id) {
        const index = farmsCache.findIndex(f => f.id === id);

        if (index === -1) {
            throw new Error('Farm not found');
        }

        farmsCache.splice(index, 1);
        saveFarms();
        return true;
    },

    async setActiveFarm(userId, farmId) {
        const farms = await this.findByUserId(userId);

        // Update isActive status
        for (const farm of farms) {
            await this.update(farm.id, { isActive: farm.id === farmId });
        }

        // Update user's activeFarmId
        await FileUserModel.update(userId, { activeFarmId: farmId });

        return this.findById(farmId);
    }
};

module.exports = { FileUserModel, FileFarmModel };
