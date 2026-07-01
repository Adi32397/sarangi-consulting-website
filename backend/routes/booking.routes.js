const express = require('express');
const {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    updateStatus,
    assignConsultant,
    rescheduleBooking,
    getAnalytics,
    generateInvoice
} = require('../controllers/booking.controller');

const { protect } = require('../middlewares/auth.middleware');
const { validate, validateBooking } = require('../middlewares/validation.middleware');

const router = express.Router();

router.get('/analytics', protect, getAnalytics);

router.route('/')
    .get(protect, getBookings)
    .post(protect, validateBooking, validate, createBooking);

router.route('/:id')
    .get(protect, getBooking)
    .put(protect, validateBooking, validate, updateBooking)
    .delete(protect, deleteBooking);

router.patch('/:id/status', protect, updateStatus);
router.patch('/:id/assign', protect, assignConsultant);
router.patch('/:id/reschedule', protect, rescheduleBooking);
router.get('/:id/invoice', protect, generateInvoice);

module.exports = router;
