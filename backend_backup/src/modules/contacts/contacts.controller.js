const contactsService = require('./contacts.service');
const contactsValidator = require('./contacts.validator');

const createContact = async (req, res, next) => {
  try {
    const validatedData = contactsValidator.validateCreateContact(req.body);
    const newContact = await contactsService.createContact(validatedData);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await contactsService.getContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await contactsService.getContactById(parseInt(req.params.id));
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    await contactsService.deleteContact(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  deleteContact
};
