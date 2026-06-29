const express = require('express');
const paymentsController = require('./payments.controller');
const { protect, admin } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

const router = express.Router();

const createPaymentSchema = z.object({
  booking_id: z.coerce.number().int().positive().optional().nullable(),
  amount: z.coerce.number().positive(),
  gateway: z.string().trim().min(1).max(50),
  transaction_id: z.string().trim().min(1).max(100).optional().nullable(),
  status: z.string().trim().min(1).max(30).optional()
});

const updatePaymentSchema = z.object({
  booking_id: z.coerce.number().int().positive().optional().nullable(),
  amount: z.coerce.number().positive().optional(),
  gateway: z.string().trim().min(1).max(50).optional(),
  transaction_id: z.string().trim().min(1).max(100).optional().nullable(),
  status: z.string().trim().min(1).max(30).optional()
});

router.get('/', protect, admin, paymentsController.getPayments);
router.post('/', protect, validate(createPaymentSchema), paymentsController.createPayment);
router.get('/:id', protect, admin, paymentsController.getPaymentById);
router.patch('/:id', protect, admin, validate(updatePaymentSchema), paymentsController.updatePayment);
router.delete('/:id', protect, admin, paymentsController.deletePayment);

module.exports = router;
