const { User, Setting } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { logActivity } = require('../utils/logger');

// Store login attempts in memory
const loginAttempts = new Map();

// Generate JWT Token
const generateToken = (id, expiresIn = process.env.JWT_EXPIRE) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: expiresIn,
    });
};
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, role } = req.body;

        const UserModel = User();

        // Check if email already exists
        const existing = await UserModel.findOne({
            where: { email }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Create user
        const user = await UserModel.create({
            name,
            email,
            password,
            phone,
            role: role || "Viewer",
            status: "active"
        });

        // Log registration
        req.user = user;
        await logActivity(req, "Auth", "User registered", {
            title: "New Registration",
            type: "info"
        });

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
        const ip = req.ip;

        // Fetch security settings
        const SettingModel = Setting();
        const securitySettings = await SettingModel.findOne({ where: { group_key: 'security' } });
        let securityData = {};
        if (securitySettings && securitySettings.value) {
            securityData = typeof securitySettings.value === 'string' ? JSON.parse(securitySettings.value) : securitySettings.value;
        }

        // Enforce IP Whitelist
        if (securityData.ip_whitelist) {
            const whitelist = securityData.ip_whitelist.split(',').map(ip => ip.trim()).filter(Boolean);
            if (whitelist.length > 0 && !whitelist.includes(ip) && !whitelist.includes('::1') && !whitelist.includes('127.0.0.1')) {
                return res.status(403).json({ success: false, message: 'Access denied from this IP address.' });
            }
        }

        // Check login attempts limit
        const maxAttempts = parseInt(securityData.maximum_login_attempts) || 5;
        const attempts = loginAttempts.get(ip) || { count: 0, lockoutEnd: null };
        if (attempts.lockoutEnd && attempts.lockoutEnd > Date.now()) {
            return res.status(429).json({ success: false, message: 'Too many login attempts, please try again later.' });
        }

        // Check for user
        const UserModel = User();
        const user = await UserModel.scope('withPassword').findOne({ where: { email } });
        
        if (!user) {
            attempts.count += 1;
            if (attempts.count >= maxAttempts) attempts.lockoutEnd = Date.now() + 15 * 60 * 1000;
            loginAttempts.set(ip, attempts);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            attempts.count += 1;
            if (attempts.count >= maxAttempts) attempts.lockoutEnd = Date.now() + 15 * 60 * 1000;
            loginAttempts.set(ip, attempts);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Clear attempts on success
        loginAttempts.delete(ip);

        if (user.status === 'inactive') {
            return res.status(401).json({ success: false, message: 'Your account is inactive' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Inject the user manually for the logger since req.user isn't set yet
        req.user = user;
        await logActivity(req, 'Auth', 'User logged in', { title: 'New Login', type: 'info' });

        // Login Alerts
        if (securityData.login_alerts === 'on' || securityData.login_alerts === true) {
            console.log(`[SECURITY] Login Alert: User ${user.email} logged in from IP ${ip}`);
            // In a real system, send an email to user.email
        }

        // Calculate session timeout
        let expiresIn = process.env.JWT_EXPIRE || '30d';
        if (securityData.session_timeout) {
            expiresIn = Math.max(1, parseInt(securityData.session_timeout)) + 'm';
        }

        const token = generateToken(user.id, expiresIn);

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

// @desc    Update logged in user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const UserModel = User();
        const user = await UserModel.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { name, email, phone, department, bio, profileImage } = req.body;
        
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (department !== undefined) user.department = department;
        if (bio !== undefined) user.bio = bio;
        if (profileImage !== undefined) user.profileImage = profileImage;
        
        await user.save();

        res.status(200).json({
            success: true,
            data: user,
            message: 'Profile updated successfully'
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
