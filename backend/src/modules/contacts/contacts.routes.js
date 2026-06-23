const express = require('express');
const contactsController = require('./contacts.controller');

const router = express.Router();

router.post('/', contactsController.createContact);
router.get('/', contactsController.getContacts);
router.get('/:id', contactsController.getContactById);
router.delete('/:id', contactsController.deleteContact);

module.exports = router;
