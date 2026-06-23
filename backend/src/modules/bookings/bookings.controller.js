const bookingsService = require('./bookings.service');
const bookingsValidator = require('./bookings.validator');

const createBooking = async (req, res, next) => {
  try {
    const validatedData = bookingsValidator.validateCreateBooking(req.body);
    const newBooking = await bookingsService.createBooking(validatedData);
    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await bookingsService.getBookings();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingsService.getBookingById(parseInt(req.params.id));
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const validatedData = bookingsValidator.validateUpdateBooking(req.body);
    const updatedBooking = await bookingsService.updateBooking(parseInt(req.params.id), validatedData);
    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking
};
