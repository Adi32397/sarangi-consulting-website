const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        if (token === 'null' || token === 'undefined') {
            token = null;
        }
    }

    if (!token) {
        // Dev bypass
        if (process.env.NODE_ENV === 'development') {
            const UserModel = User();
            const superAdmin = await UserModel.findOne({ where: { role: 'Super Admin' } });
            if (superAdmin) {
                req.user = superAdmin;
            } else {
                req.user = { id: 'dev-mode-user', role: 'Super Admin', status: 'active' };
            }
            return next();
        }
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const UserModel = User();
        req.user = await UserModel.findByPk(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        // Check if user is active
        if (req.user.status === 'inactive') {
            return res.status(401).json({ success: false, message: 'User account is inactive' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
