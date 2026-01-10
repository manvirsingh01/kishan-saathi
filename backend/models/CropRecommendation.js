const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CropRecommendation = sequelize.define('CropRecommendation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    inputParams: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    recommendations: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    aiModel: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    season: {
        type: DataTypes.STRING
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = CropRecommendation;
