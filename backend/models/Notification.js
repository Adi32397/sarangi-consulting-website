const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

let Notification;

const initNotification = () => {
    const sequelize = getSequelize();
    
    Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
            defaultValue: 'info'
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Notification;
};

module.exports = {
    initNotification,
    getNotification: () => Notification
};
