const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/read', protect, markAsRead);

module.exports = router;
