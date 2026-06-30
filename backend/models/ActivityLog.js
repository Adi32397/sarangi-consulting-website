const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

let ActivityLog;

const initActivityLog = () => {
    const sequelize = getSequelize();
    
    ActivityLog = sequelize.define('ActivityLog', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'System'
        },
        module: {
            type: DataTypes.STRING,
            allowNull: false
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Unknown'
        },
        browser: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Unknown'
        },
        status: {
            type: DataTypes.ENUM('Success', 'Failed'),
            defaultValue: 'Success'
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false // We don't really need updatedAt for logs
    });

    return ActivityLog;
};

module.exports = {
    initActivityLog,
    getActivityLog: () => ActivityLog
};
