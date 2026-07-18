const { check, validationResult } = require('express-validator');

// Validation middleware generic handler
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

const registerValidation = [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Invalid role').optional().isIn(['Super Admin', 'Admin', 'Manager', 'Employee', 'Viewer']),
    validate
];

const loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    validate
];

const forgotPasswordValidation = [
    check('email', 'Please include a valid email').isEmail(),
    validate
];

const resetPasswordValidation = [
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validate
];

const changePasswordValidation = [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 }),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation
};
