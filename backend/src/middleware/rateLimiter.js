const rateLimit = require('express-rate-limit');

// General rate limiter — applied globally
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

// Strict rate limiter for auth routes (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts from this IP. Please try again after 15 minutes.' }
});

// Lenient limiter for public read endpoints (banners, services)
const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' }
});

module.exports = { generalLimiter, authLimiter, publicLimiter };
