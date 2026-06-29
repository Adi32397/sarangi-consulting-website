const express = require('express');
const {
    getSettings,
    updateSettingsGroup,
    getActivityLogs,
    getSystemHealthAndAnalytics
} = require('../controllers/settings.controller');

const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, getSettings);
router.get('/logs', protect, getActivityLogs);
router.get('/health', protect, getSystemHealthAndAnalytics);
router.put('/:group', protect, updateSettingsGroup);

module.exports = router;
