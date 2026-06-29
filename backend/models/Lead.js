const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

let Lead;

const initLead = () => {
    const sequelize = getSequelize();
    
    Lead = sequelize.define('Lead', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        leadId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        customerName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add a customer name' }
            }
        },
        company: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        email: {
            type: DataTypes.STRING,
            defaultValue: '',
            validate: {
                isEmailOrEmpty(value) {
                    if (value && value.trim() !== '') {
                        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
                            throw new Error('Please add a valid email');
                        }
                    }
                }
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add a phone number' }
            }
        },
        serviceInterested: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add interested service' }
            }
        },
        leadSource: {
            type: DataTypes.STRING,
            defaultValue: 'Website'
        },
        assignedConsultant: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null
        },
        priority: {
            type: DataTypes.ENUM('High', 'Medium', 'Low'),
            defaultValue: 'Medium'
        },
        status: {
            type: DataTypes.ENUM('New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'),
            defaultValue: 'New'
        },
        message: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        internalNotes: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        communicationHistory: {
            type: DataTypes.JSON,
            defaultValue: []
        }
    }, {
        timestamps: true,
        indexes: [
            { name: 'idx_lead_email', fields: ['email'] },
            { name: 'idx_lead_status', fields: ['status'] },
            { name: 'idx_lead_consultant', fields: ['assignedConsultant'] },
            { name: 'idx_lead_created_at', fields: ['createdAt'] }
        ],
        hooks: {
            beforeValidate: (lead) => {
                if (!lead.leadId) {
                    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
                    const randomStr = Math.floor(1000 + Math.random() * 9000);
                    lead.leadId = `LD-${dateStr}-${randomStr}`;
                }
            }
        }
    });

    return Lead;
};

module.exports = {
    initLead,
    getLead: () => Lead
};
