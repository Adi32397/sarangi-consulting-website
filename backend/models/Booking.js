const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

let Booking;

const initBooking = () => {
    const sequelize = getSequelize();
    
    Booking = sequelize.define('Booking', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        booking_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        client_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add a client name' }
            }
        },
        company: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: { msg: 'Please add a valid email' },
                notEmpty: { msg: 'Please add an email' }
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add a phone number' }
            }
        },
        consultation_type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add consultation type' }
            }
        },
        consultant: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please assign a consultant' }
            }
        },
        booking_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add booking date' }
            }
        },
        booking_time: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add booking time' }
            }
        },
        duration: {
            type: DataTypes.INTEGER, // in minutes
            defaultValue: 60
        },
        meeting_mode: {
            type: DataTypes.ENUM('Online', 'Offline', 'Phone Call'),
            defaultValue: 'Online'
        },
        meeting_link: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        payment_status: {
            type: DataTypes.ENUM('Pending', 'Paid', 'Failed', 'Refunded'),
            defaultValue: 'Pending'
        },
        booking_status: {
            type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled', 'Rescheduled', 'Upcoming', 'Completed'),
            defaultValue: 'Pending'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        gst: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        invoice_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            defaultValue: ''
        }
    }, {
        timestamps: true,
        indexes: [
            { name: 'idx_booking_date', fields: ['booking_date'] },
            { name: 'idx_booking_status', fields: ['booking_status'] },
            { name: 'idx_payment_status', fields: ['payment_status'] }
        ],
        hooks: {
            beforeValidate: (booking) => {
                if (!booking.booking_id) {
                    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
                    const randomStr = Math.floor(1000 + Math.random() * 9000);
                    booking.booking_id = `BK-${dateStr}-${randomStr}`;
                }
            }
        }
    });

    return Booking;
};

module.exports = {
    initBooking,
    getBooking: () => Booking
};
