const { getSheet, generateId } = require('../../config/googleSheets');

/**
 * Farm model using Google Sheets as backend
 */
class FarmSheet {
    static SHEET_NAME = 'Farms';

    /**
     * Find all farms for a user
     */
    static async findByUserId(userId) {
        const sheet = await getSheet(this.SHEET_NAME);
        const rows = await sheet.getRows();

        return rows
            .filter(row => row.get('userId') === userId)
            .map(row => this.rowToFarm(row));
    }

    /**
     * Find farm by ID
     */
    static async findById(id) {
        const sheet = await getSheet(this.SHEET_NAME);
        const rows = await sheet.getRows();

        const farmRow = rows.find(row => row.get('id') === id);
        return farmRow ? this.rowToFarm(farmRow) : null;
    }

    /**
     * Create a new farm
     */
    static async create(farmData) {
        const sheet = await getSheet(this.SHEET_NAME);

        const id = generateId();
        const now = new Date().toISOString();

        const newRow = await sheet.addRow({
            id,
            userId: farmData.userId,
            name: farmData.name || 'My Farm',
            pincode: farmData.pincode || '',
            village: farmData.village || '',
            state: farmData.state || '',
            district: farmData.district || '',
            latitude: farmData.latitude || farmData.coordinates?.[1] || 0,
            longitude: farmData.longitude || farmData.coordinates?.[0] || 0,
            landArea: farmData.landArea || 0,
            landType: farmData.landType || 'irrigated',
            soilType: farmData.soilType || 'alluvial',
            isActive: farmData.isActive ? 'true' : 'false',
            createdAt: now,
            updatedAt: now
        });

        return this.rowToFarm(newRow);
    }

    /**
     * Update farm
     */
    static async update(id, updateData) {
        const sheet = await getSheet(this.SHEET_NAME);
        const rows = await sheet.getRows();

        const farmRow = rows.find(row => row.get('id') === id);
        if (!farmRow) {
            throw new Error('Farm not found');
        }

        // Update fields
        for (const [key, value] of Object.entries(updateData)) {
            if (key !== 'id' && key !== 'userId') {
                if (key === 'isActive') {
                    farmRow.set(key, value ? 'true' : 'false');
                } else {
                    farmRow.set(key, value);
                }
            }
        }
        farmRow.set('updatedAt', new Date().toISOString());

        await farmRow.save();
        return this.rowToFarm(farmRow);
    }

    /**
     * Delete farm
     */
    static async delete(id) {
        const sheet = await getSheet(this.SHEET_NAME);
        const rows = await sheet.getRows();

        const farmRow = rows.find(row => row.get('id') === id);
        if (!farmRow) {
            throw new Error('Farm not found');
        }

        await farmRow.delete();
        return true;
    }

    /**
     * Set active farm for user
     */
    static async setActiveFarm(userId, farmId) {
        const sheet = await getSheet(this.SHEET_NAME);
        const rows = await sheet.getRows();

        // Deactivate all farms for user
        const userFarms = rows.filter(row => row.get('userId') === userId);
        for (const farm of userFarms) {
            farm.set('isActive', farm.get('id') === farmId ? 'true' : 'false');
            await farm.save();
        }

        // Update user's activeFarmId
        const UserSheet = require('./UserSheet');
        await UserSheet.update(userId, { activeFarmId: farmId });

        return this.findById(farmId);
    }

    /**
     * Convert sheet row to farm object
     */
    static rowToFarm(row) {
        return {
            id: row.get('id'),
            userId: row.get('userId'),
            name: row.get('name'),
            pincode: row.get('pincode'),
            village: row.get('village'),
            state: row.get('state'),
            district: row.get('district'),
            latitude: parseFloat(row.get('latitude')) || 0,
            longitude: parseFloat(row.get('longitude')) || 0,
            landArea: parseFloat(row.get('landArea')) || 0,
            landType: row.get('landType'),
            soilType: row.get('soilType'),
            isActive: row.get('isActive') === 'true',
            createdAt: row.get('createdAt'),
            updatedAt: row.get('updatedAt'),
            // Computed properties for compatibility
            location: {
                coordinates: [parseFloat(row.get('longitude')) || 0, parseFloat(row.get('latitude')) || 0],
                state: row.get('state'),
                district: row.get('district'),
                village: row.get('village'),
                pincode: row.get('pincode')
            }
        };
    }
}

module.exports = FarmSheet;
