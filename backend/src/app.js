const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Define Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Feature Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/contact', require('./modules/contacts/contacts.routes'));
app.use('/api/bookings', require('./modules/bookings/bookings.routes'));
app.use('/api/services', require('./modules/services/services.routes'));
app.use('/api/banners', require('./modules/banners/banners.routes'));
app.use('/api/notifications', notificationsRoutes);
app.use('/api/payments', require('./modules/payments/payments.routes'));
app.use('/api/whatsapp', require('./modules/whatsapp/whatsapp.routes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;