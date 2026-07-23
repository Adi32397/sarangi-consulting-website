const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const initEmployee = () => {
    const sequelize = getSequelize();

    const Employee = sequelize.define('Employee', {
        employee_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        phone: {
            type: DataTypes.STRING
        },
        designation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        department: {
            type: DataTypes.STRING,
            allowNull: false
        },
        joining_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        salary: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Active'
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'employees',
        timestamps: true
    });

    return Employee;
};

module.exports = { initEmployee };