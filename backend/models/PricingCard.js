const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

let PricingCard;

const initPricingCard = () => {
    const sequelize = getSequelize();
    
    PricingCard = sequelize.define('PricingCard', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add a card title' }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add a description' }
            }
        },
        price_strike: {
            type: DataTypes.STRING,
            allowNull: true // Optional field
        },
        price_active: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add an active price' }
            }
        },
        urgency_text: {
            type: DataTypes.STRING,
            allowNull: true // Optional field
        },
        is_highlighted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        order_index: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        features: {
            type: DataTypes.JSON,
            defaultValue: [] // Stores the bullet points as a JSON array
        },
        button_text: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Schedule a Discovery Call' // The default for normal cards
        }
    }, {
        // Keeps the table name exactly as 'PricingCard' instead of pluralizing it to 'PricingCards'
        tableName: 'PricingCard', 
        timestamps: true, // Automatically adds createdAt and updatedAt
        indexes: [
            // Adding an index here makes sorting by order_index much faster for the frontend
            { name: 'idx_order_index', fields: ['order_index'] } 
        ]
    });

    return PricingCard;
};

module.exports = {
    initPricingCard,
    PricingCard: () => PricingCard
};