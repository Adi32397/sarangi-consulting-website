const express = require('express');
const {
    getSettings,
    updateSettingsGroup,
    getActivityLogs,
    getSystemHealthAndAnalytics,
    testEmail,
    getSmtpConfig,
    updateSmtpConfig
} = require('../controllers/settings.controller');

const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, getSettings);
router.get('/public', getSettings);
router.get('/logs', protect, getActivityLogs);
router.get('/health', protect, getSystemHealthAndAnalytics);

// SMTP Routes
router.get('/smtp', protect, getSmtpConfig);
router.post('/smtp', protect, updateSmtpConfig);
router.post('/smtp/test', protect, testEmail);

router.put('/:group', protect, updateSettingsGroup);

module.exports = router;
