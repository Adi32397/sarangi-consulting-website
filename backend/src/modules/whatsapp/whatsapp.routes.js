const express = require('express');
const whatsappController = require('./whatsapp.controller');
const { protect, admin } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public endpoint to log clicks from the floating button
router.post('/click', whatsappController.logClick);

// Admin endpoint to view WhatsApp analytics
router.get('/clicks', protect, admin, whatsappController.getClicks);

module.exports = router;
