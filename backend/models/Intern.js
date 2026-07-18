const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const initIntern = () => {
    const sequelize = getSequelize();

    const Intern = sequelize.define('Intern', {
        intern_id: {
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
        // --- INTERN SPECIFIC FIELDS ---
        university: {
            type: DataTypes.STRING,
            allowNull: true
        },
        duration_months: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        mentor: {
            type: DataTypes.STRING,
            allowNull: true // To track which senior employee is managing them
        },
        stipend: {
            type: DataTypes.INTEGER, // Replaces 'salary'
            allowNull: false,
            defaultValue: 0
        },
        // --- STANDARD WORK FIELDS ---
        role: {
            type: DataTypes.STRING, // Replaces 'designation'
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
        status: {
            type: DataTypes.ENUM('Active', 'Completed', 'Terminated'),
            allowNull: false,
            defaultValue: 'Active'
        }
    }, {
        tableName: 'interns',
        timestamps: true
    });

    return Intern;
};

module.exports = { initIntern };