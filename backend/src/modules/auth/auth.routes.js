const express = require('express');
const authController = require('./auth.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimiter');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

const router = express.Router();

// Zod schemas for inline route validation
const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(20).optional(),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().trim().email().max(150),
  password: z.string().min(1).max(100)
});

// Apply rate limiting to all auth endpoints
router.use(authLimiter);

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/profile', protect, authController.getProfile);

module.exports = router;
