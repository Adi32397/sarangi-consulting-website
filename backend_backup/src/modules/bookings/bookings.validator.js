const { z } = require('zod');

const createBookingSchema = z.object({
  user_id: z.number(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  business_name: z.string().optional(),
  booking_date: z.string().transform((str) => new Date(str)),
  booking_time: z.string()
});

const updateBookingSchema = z.object({
  status: z.string().optional(),
  booking_date: z.string().transform((str) => new Date(str)).optional(),
  booking_time: z.string().optional()
});

const validateCreateBooking = (data) => {
  return createBookingSchema.parse(data);
};

const validateUpdateBooking = (data) => {
  return updateBookingSchema.parse(data);
};

module.exports = {
  validateCreateBooking,
  validateUpdateBooking
};
