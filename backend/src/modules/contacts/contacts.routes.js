const express = require('express');
const contactsController = require('./contacts.controller');
const { generalLimiter } = require('../../middleware/rateLimiter');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

const router = express.Router();

const createContactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(2000)
});

router.post('/', generalLimiter, validate(createContactSchema), contactsController.createContact);
router.get('/', contactsController.getContacts);
router.get('/:id', contactsController.getContactById);
router.delete('/:id', contactsController.deleteContact);

module.exports = router;
