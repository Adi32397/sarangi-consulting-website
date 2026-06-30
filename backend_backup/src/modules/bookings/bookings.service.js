const prisma = require('../../config/prisma');

const createBooking = async (data) => {
  return await prisma.booking.create({
    data
  });
};

const getBookings = async () => {
  return await prisma.booking.findMany({
    orderBy: { created_at: 'desc' }
  });
};

const getBookingById = async (id) => {
  return await prisma.booking.findUnique({
    where: { id }
  });
};

const updateBooking = async (id, data) => {
  return await prisma.booking.update({
    where: { id },
    data
  });
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking
};
