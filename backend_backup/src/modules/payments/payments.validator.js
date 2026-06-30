const { z } = require('zod');

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

const validateCreatePayment = (body) => createPaymentSchema.parse(body);
const validateUpdatePayment = (body) => updatePaymentSchema.parse(body);

module.exports = {
  validateCreatePayment,
  validateUpdatePayment
};
