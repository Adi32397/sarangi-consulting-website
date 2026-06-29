const express = require('express');
const bookingsController = require('./bookings.controller');

const router = express.Router();

router.post('/', bookingsController.createBooking);
router.get('/', bookingsController.getBookings);
router.get('/:id', bookingsController.getBookingById);
router.patch('/:id', bookingsController.updateBooking);

module.exports = router;
