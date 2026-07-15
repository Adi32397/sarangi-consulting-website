const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const initUploadedDocument = () => {
    const sequelize = getSequelize();
    return sequelize.define('UploadedDocument', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false }, // The employee/intern receiving it
        title: { type: DataTypes.STRING, allowNull: false },
        filePath: { type: DataTypes.STRING, allowNull: false }, // Where the file lives on the server
        uploadedBy: { type: DataTypes.UUID, allowNull: false } // The Admin who uploaded it
    });
};
module.exports = { initUploadedDocument };