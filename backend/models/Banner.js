const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

let Banner;

const initBanner = () => {
    const sequelize = getSequelize();
    
    Banner = sequelize.define('Banner', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        banner_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add a banner title' }
            }
        },
        subtitle: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        image: {
            type: DataTypes.STRING, // URL/Path to image
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please upload or provide an image URL' }
            }
        },
        button_text: {
            type: DataTypes.STRING,
            defaultValue: 'Learn More'
        },
        button_url: {
            type: DataTypes.STRING,
            defaultValue: '#'
        },
        banner_type: {
            type: DataTypes.ENUM('Homepage Hero', 'Promotion', 'Announcement', 'Campaign', 'Service Banner', 'Event Banner'),
            defaultValue: 'Promotion'
        },
        display_position: {
            type: DataTypes.ENUM('Homepage', 'Services', 'Sidebar', 'Footer', 'About'),
            defaultValue: 'Homepage'
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        status: {
            type: DataTypes.ENUM('Active', 'Scheduled', 'Expired', 'Draft'),
            defaultValue: 'Draft'
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        qr_code: {
            type: DataTypes.TEXT, // Storing Base64 Data URI
            allowNull: true
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        clicks: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        creator: {
            type: DataTypes.STRING,
            defaultValue: 'Admin'
        }
    }, {
        timestamps: true,
        indexes: [
            { fields: ['status'] },
            { fields: ['banner_type'] }
        ],
        hooks: {
            beforeValidate: (banner) => {
                if (!banner.banner_id) {
                    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
                    const randomStr = Math.floor(1000 + Math.random() * 9000);
                    banner.banner_id = `BN-${dateStr}-${randomStr}`;
                }
            }
        }
    });

    return Banner;
};

module.exports = {
    initBanner,
    getBanner: () => Banner
};
