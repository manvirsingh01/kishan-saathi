const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GovernmentInfo = sequelize.define('GovernmentInfo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    description: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    details: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    attachments: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    createdBy: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    lastModifiedBy: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

module.exports = GovernmentInfo;
