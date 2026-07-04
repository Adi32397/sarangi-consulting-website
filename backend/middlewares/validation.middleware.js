const { check, validationResult } = require('express-validator');

// Common response formatter for validation errors
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map(e => e.msg).join(', ');
        return res.status(400).json({ success: false, message, errors: errors.array() });
    }
    next();
};

// Lead Validations
exports.validateLead = [
    check('customerName', 'Customer Name is required').notEmpty(),
    check('phone', 'Phone is required').notEmpty(),
    check('serviceInterested', 'Service Interested is required').notEmpty(),
    check('email').optional({ checkFalsy: true }).isEmail().withMessage('Please include a valid email')
];

// Booking Validations
exports.validateBooking = [
    check('client_name', 'Client Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone is required').notEmpty(),
    check('consultation_type', 'Consultation type is required').notEmpty(),
    check('consultant', 'Consultant is required').notEmpty(),
    check('booking_date', 'Booking date is required').notEmpty(),
    check('booking_time', 'Booking time is required').notEmpty()
];

// Banner Validations
exports.validateBanner = [
    check('title', 'Title is required').notEmpty()
];

// Pricing Card Validations
exports.validatePricingCard = [
    check('title', 'Title is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('price_active', 'Active price is required').notEmpty(),
    check('order_index', 'Order index must be a number').optional().isInt(),
    check('button_text', 'Button text is required').optional().notEmpty()
];
