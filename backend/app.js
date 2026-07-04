const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorHandler');

// Route files
const authRoutes = require('./routes/auth.routes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));

// Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter);

// Enable CORS
app.use(cors());

const path = require('path');

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Public contact route
const { createLead } = require('./controllers/lead.controller');
const { validateLead, validate } = require('./middlewares/validation.middleware');
app.post('/api/contact', validateLead, validate, createLead);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', require('./routes/lead.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/banners', require('./routes/banner.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/activity-logs', require('./routes/activity-log.routes'));
app.use('/api/exports', require('./routes/export.routes'));
app.use('/api/chatbot', require('./routes/chatbot.routes'));
// Error handler middleware
app.use(errorHandler);

module.exports = app;
