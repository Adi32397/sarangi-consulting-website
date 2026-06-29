const express = require('express');
const {
    getSettings,
    updateSettingsGroup,
    getActivityLogs
} = require('../controllers/settings.controller');

const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, getSettings);
router.get('/logs', protect, getActivityLogs);
router.put('/:group', protect, updateSettingsGroup);

module.exports = router;
