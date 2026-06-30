const express = require('express');
const {
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    getProfile,
    refreshToken,
    getAllUsers
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');
const {
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation
} = require('../middlewares/auth.validation');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' }
});

router.post('/login', loginLimiter, loginValidation, login);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/change-password', protect, changePasswordValidation, changePassword);
router.get('/profile', protect, getProfile);
router.get('/refresh-token', protect, refreshToken);
router.get('/users', protect, getAllUsers);

module.exports = router;
