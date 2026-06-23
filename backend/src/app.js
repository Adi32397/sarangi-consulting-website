const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Define Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Feature Routes
app.use('/api/contact', require('./modules/contacts/contacts.routes'));
app.use('/api/bookings', require('./modules/bookings/bookings.routes'));
app.use('/api/services', require('./modules/services/services.routes'));
app.use('/api/banners', require('./modules/banners/banners.routes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
