const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const initDocumentRequest = () => {
    const sequelize = getSequelize();
    return sequelize.define('DocumentRequest', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false }, // Links to Users table
        documentType: { type: DataTypes.STRING, allowNull: false }, // e.g., 'Form 16', 'Visa Letter'
        reason: { type: DataTypes.TEXT },
        status: { 
            type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Rejected'),
            defaultValue: 'Pending'
        }
    });
};
module.exports = { initDocumentRequest };