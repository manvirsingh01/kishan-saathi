const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LossReport = sequelize.define('LossReport', {
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
    period: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    climateImpact: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    yieldLoss: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    financialLoss: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    evidence: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    insuranceInfo: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    governmentCompensation: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'draft'
    },
    pdfGenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    pdfPath: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: (report) => {
            if (!report.reportId) {
                const timestamp = Date.now();
                const random = Math.floor(Math.random() * 1000);
                report.reportId = `KS-LOSS-${timestamp}-${random}`;
            }
        }
    }
});

module.exports = LossReport;
