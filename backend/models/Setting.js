const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

let Setting;

const initSetting = () => {
    const sequelize = getSequelize();
    
    Setting = sequelize.define('Setting', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        group_key: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        value: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        timestamps: true
    });

    return Setting;
};

module.exports = {
    initSetting,
    getSetting: () => Setting
};
