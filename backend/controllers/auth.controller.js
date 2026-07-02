const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { logActivity } = require('../utils/logger');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, role } = req.body;

        const UserModel = User();
        // Check if user exists
        let user = await UserModel.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        user = await UserModel.create({
            name,
            email,
            password,
            phone,
            role: role || 'Viewer',
        });

        // Inject the user manually for the logger since req.user isn't set yet
        req.user = user;
        await logActivity(req, 'Auth', 'User registered', { title: 'New Registration', type: 'info' });

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const UserModel = User();
        const user = await UserModel.scope('withPassword').findOne({ where: { email } });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.status === 'inactive') {
            return res.status(401).json({ success: false, message: 'Your account is inactive' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Inject the user manually for the logger since req.user isn't set yet
        req.user = user;
        await logActivity(req, 'Auth', 'User logged in', { title: 'New Login', type: 'info' });

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully (client should discard token)'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        const UserModel = User();
        const user = await UserModel.findByPk(req.user.id);
        
        let leadData = null;
        try {
            const LeadModel = require('../models').Lead();
            if (LeadModel) {
                const lead = await LeadModel.findOne({ where: { email: user.email } });
                if (lead) {
                    leadData = {
                        company: lead.company,
                        serviceInterested: lead.serviceInterested
                    };
                }
            }
        } catch (e) {
            console.error("Error fetching lead data for profile", e);
        }

        res.status(200).json({
            success: true,
            data: {
                ...user.toJSON(),
                lead: leadData
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot Password (Mock)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const UserModel = User();
        const user = await UserModel.findOne({ where: { email: req.body.email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }
        res.status(200).json({
            success: true,
            message: 'Password reset email sent (Mocked)',
            mockResetToken: 'mock-reset-token-123'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password (Mock)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const UserModel = User();
        const user = await UserModel.findOne({ where: { email } });
        
        if (!user) {
             return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = password;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            token: generateToken(user.id)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change Password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const UserModel = User();
        const user = await UserModel.scope('withPassword').findByPk(req.user.id);

        const { currentPassword, newPassword } = req.body;

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Password incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            token: generateToken(user.id)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh Token
// @route   GET /api/auth/refresh-token
// @access  Private
exports.refreshToken = async (req, res, next) => {
    try {
        const token = generateToken(req.user.id);
        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (for assigning consultants)
// @route   GET /api/auth/users
// @access  Private
exports.getAllUsers = async (req, res, next) => {
    try {
        const UserModel = User();
        const users = await UserModel.findAll({
            attributes: ['id', 'name', 'email', 'role']
        });
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};
