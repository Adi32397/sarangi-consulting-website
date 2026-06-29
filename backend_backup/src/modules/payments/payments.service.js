const prisma = require('../../config/prisma');

const getPayments = async () => {
  return prisma.payment.findMany({
    orderBy: { created_at: 'desc' }
  });
};

const getPaymentById = async (id) => {
  return prisma.payment.findUnique({
    where: { id }
  });
};

const createPayment = async (data) => {
  return prisma.payment.create({
    data: {
      ...data,
      booking_id: data.booking_id ? Number(data.booking_id) : null
    }
  });
};

const updatePayment = async (id, data) => {
  return prisma.payment.update({
    where: { id },
    data: {
      ...data,
      booking_id: data.booking_id !== undefined ? Number(data.booking_id) : undefined
    }
  });
};

const deletePayment = async (id) => {
  return prisma.payment.delete({
    where: { id }
  });
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};
