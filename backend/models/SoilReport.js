const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SoilReport = sequelize.define('SoilReport', {
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
    reportId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    // Location data
    location: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    // Uploaded file info
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileSize: {
        type: DataTypes.INTEGER
    },
    // Extracted soil data from PDF
    soilData: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    // AI Analysis
    aiAnalysis: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    // Crop Recommendations
    cropRecommendations: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    // Status
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending', // pending, analyzed, failed
        validate: {
            isIn: [['pending', 'analyzed', 'failed']]
        }
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: (report) => {
            if (!report.reportId) {
                const timestamp = Date.now();
                const random = Math.floor(Math.random() * 1000);
                report.reportId = `SR-${timestamp}-${random}`;
            }
        }
    }
});

module.exports = SoilReport;
