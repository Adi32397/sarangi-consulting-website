const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { getSequelize } = require('../config/database');

// We need a getter to initialize the model after the DB connects
let User;

const initUser = () => {
    const sequelize = getSequelize();
    
    User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add a name' }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: { msg: 'Please add a valid email' },
                notEmpty: { msg: 'Please add an email' }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please add a password' },
                len: {
                    args: [6, 255],
                    msg: 'Password must be at least 6 characters'
                }
            }
        },
        phone: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        role: {
            type: DataTypes.ENUM('Super Admin', 'Admin', 'Manager', 'Viewer'),
            defaultValue: 'Viewer'
        },
        profileImage: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        lastLogin: {
            type: DataTypes.DATE,
            defaultValue: null
        }
    }, {
        timestamps: true,
        indexes: [
            { fields: ['email'], unique: true },
            { fields: ['role'] }
        ],
        defaultScope: {
            attributes: { exclude: ['password'] }
        },
        scopes: {
            withPassword: {
                attributes: {}
            }
        },
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    // Instance method
    User.prototype.matchPassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    };

    return User;
};

module.exports = {
    initUser,
    getUser: () => User
};
