const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Authentication
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [10, 10]
        }
    },

    // Multiple Farms (stored as JSON array)
    farms: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },

    // Active farm ID
    activeFarmId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },

    // Legacy farmDetails (for backward compatibility during migration)
    farmDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },

    // Preferences
    language: {
        type: DataTypes.STRING,
        defaultValue: 'en'
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'farmer',
        validate: {
            isIn: [['farmer', 'admin']]
        }
    },

    // Metadata
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
            // Migrate farmDetails to farms array if present
            if (user.farmDetails && (!user.farms || user.farms.length === 0)) {
                const farmId = `farm_${Date.now()}`;
                user.farms = [{
                    id: farmId,
                    name: 'My Farm',
                    ...user.farmDetails
                }];
                user.activeFarmId = farmId;
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        afterFind: async (result) => {
            // Migrate legacy data on read
            const migrateUser = async (user) => {
                if (user && user.farmDetails && (!user.farms || user.farms.length === 0)) {
                    const farmId = `farm_${Date.now()}`;
                    user.farms = [{
                        id: farmId,
                        name: 'My Farm',
                        ...user.farmDetails
                    }];
                    user.activeFarmId = farmId;
                    await user.save({ hooks: false });
                }
            };

            if (Array.isArray(result)) {
                for (const user of result) {
                    await migrateUser(user);
                }
            } else {
                await migrateUser(result);
            }
        }
    }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get active farm
User.prototype.getActiveFarm = function () {
    if (!this.farms || this.farms.length === 0) return null;
    if (this.activeFarmId) {
        return this.farms.find(f => f.id === this.activeFarmId) || this.farms[0];
    }
    return this.farms[0];
};

// Override toJSON to exclude password and include computed farmDetails
User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;

    // For backward compatibility, set farmDetails to active farm
    const activeFarm = this.getActiveFarm();
    if (activeFarm) {
        values.farmDetails = activeFarm;
    }

    return values;
};

module.exports = User;
