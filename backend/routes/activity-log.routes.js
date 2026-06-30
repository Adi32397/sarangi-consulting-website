const express = require('express');
const { getActivityLogs } = require('../controllers/settings.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, getActivityLogs);

module.exports = router;
