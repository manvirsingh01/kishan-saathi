const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClimateData = sequelize.define('ClimateData', {
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
    location: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    stressIndicators: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    riskAssessment: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    weatherData: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    dataSource: {
        type: DataTypes.STRING,
        defaultValue: 'Open-Meteo'
    },
    season: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

module.exports = ClimateData;
