const paymentsService = require('./payments.service');

const getPayments = async (req, res, next) => {
  try {
    const payments = await paymentsService.getPayments();
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentsService.getPaymentById(Number(req.params.id));
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const payment = await paymentsService.createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const payment = await paymentsService.updatePayment(Number(req.params.id), req.body);
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    await paymentsService.deletePayment(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};
