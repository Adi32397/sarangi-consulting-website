const express = require('express');
const adminController = require('./admin.controller');
const { protect, admin } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/stats', protect, admin, adminController.getDashboardStats);

module.exports = router;
