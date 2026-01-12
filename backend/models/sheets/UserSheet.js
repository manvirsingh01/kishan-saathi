const bcrypt = require('bcryptjs');
const { getSheet, generateId } = require('../../config/googleSheets');

/**
 * User model using Google Sheets as backend
 */
class UserSheet {
    static SHEET_NAME = 'Users';

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const sheet = await getSheet(this.SHEET_NAME);
        const rows = await sheet.getRows();

        const userRow = rows.find(row => row.get('email') === email);
        return userRow ? this.rowToUser(userRow) : null;
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const sheet = await getSheet(this.SHEET_NAME);
        const rows = await sheet.getRows();

        const userRow = rows.find(row => row.get('id') === id);
        return userRow ? this.rowToUser(userRow) : null;
    }

    /**
     * Create a new user
     */
    static async create(userData) {
        const sheet = await getSheet(this.SHEET_NAME);

        // Check if email already exists
        const existing = await this.findByEmail(userData.email);
        if (existing) {
            throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const id = generateId();
        const now = new Date().toISOString();

        const newRow = await sheet.addRow({
            id,
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone || '',
            role: userData.role || 'farmer',
            activeFarmId: '',
            createdAt: now,
            updatedAt: now
        });

        const user = this.rowToUser(newRow);

        // Create initial farm if farmDetails provided
        if (userData.farmDetails) {
            const FarmSheet = require('./FarmSheet');
            const farm = await FarmSheet.create({
                userId: id,
                name: 'My Farm',
                ...userData.farmDetails.location,
                landArea: userData.farmDetails.landArea,
                landType: userData.farmDetails.landType,
                soilType: userData.farmDetails.soilType,
                isActive: true
            });

            // Update activeFarmId
            await this.update(id, { activeFarmId: farm.id });
            user.activeFarmId = farm.id;
        }

        return user;
    }

    /**
     * Update user
     */
    static async update(id, updateData) {
        const sheet = await getSheet(this.SHEET_NAME);
        const rows = await sheet.getRows();

        const userRow = rows.find(row => row.get('id') === id);
        if (!userRow) {
            throw new Error('User not found');
        }

        // Update fields
        for (const [key, value] of Object.entries(updateData)) {
            if (key !== 'id' && key !== 'password') {
                userRow.set(key, value);
            }
        }
        userRow.set('updatedAt', new Date().toISOString());

        await userRow.save();
        return this.rowToUser(userRow);
    }

    /**
     * Validate password
     */
    static async validatePassword(user, password) {
        return bcrypt.compare(password, user.password);
    }

    /**
     * Convert sheet row to user object
     */
    static rowToUser(row) {
        return {
            id: row.get('id'),
            name: row.get('name'),
            email: row.get('email'),
            password: row.get('password'),
            phone: row.get('phone'),
            role: row.get('role'),
            activeFarmId: row.get('activeFarmId'),
            createdAt: row.get('createdAt'),
            updatedAt: row.get('updatedAt'),
            _row: row // Keep reference for updates
        };
    }

    /**
     * Get user with active farm details (for API response)
     */
    static async getWithFarmDetails(id) {
        const user = await this.findById(id);
        if (!user) return null;

        const FarmSheet = require('./FarmSheet');
        const farms = await FarmSheet.findByUserId(id);
        const activeFarm = farms.find(f => f.id === user.activeFarmId) || farms[0];

        // Format for API (matches old Sequelize format)
        const result = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            farms: farms,
            activeFarmId: user.activeFarmId,
            farmDetails: activeFarm ? {
                name: activeFarm.name,
                location: {
                    coordinates: [activeFarm.longitude, activeFarm.latitude],
                    state: activeFarm.state,
                    district: activeFarm.district,
                    village: activeFarm.village,
                    pincode: activeFarm.pincode
                },
                landArea: activeFarm.landArea,
                landType: activeFarm.landType,
                soilType: activeFarm.soilType
            } : null
        };

        return result;
    }
}

module.exports = UserSheet;
