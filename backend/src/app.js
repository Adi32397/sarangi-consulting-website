require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// ─── SECURITY HEADERS ──────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ──────────────────────────────────────────────────────────────────────
// Whitelist only known origins. Adjust in production.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:5500').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (Postman, curl) only in dev
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

// ─── BODY PARSING + SIZE LIMITS ────────────────────────────────────────────────
// Reject bodies larger than 10kb — prevents large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── LOGGING ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ─── GLOBAL RATE LIMITER ───────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ─── FEATURE ROUTES ────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./modules/auth/auth.routes'));
app.use('/api/admin',     require('./modules/admin/admin.routes'));
app.use('/api/contact',   require('./modules/contacts/contacts.routes'));
app.use('/api/bookings',  require('./modules/bookings/bookings.routes'));
app.use('/api/services',  require('./modules/services/services.routes'));
app.use('/api/banners',   require('./modules/banners/banners.routes'));
app.use('/api/whatsapp',  require('./modules/whatsapp/whatsapp.routes'));

// ─── 404 HANDLER ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Never leak internal error details to the client in production
  const isDev = process.env.NODE_ENV !== 'production';
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  });
});

module.exports = app;
