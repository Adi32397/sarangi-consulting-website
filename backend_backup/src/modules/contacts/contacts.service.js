const prisma = require('../../config/prisma');

const createContact = async (data) => {
  return await prisma.contact.create({
    data
  });
};

const getContacts = async () => {
  return await prisma.contact.findMany({
    orderBy: { created_at: 'desc' }
  });
};

const getContactById = async (id) => {
  return await prisma.contact.findUnique({
    where: { id }
  });
};

const deleteContact = async (id) => {
  return await prisma.contact.delete({
    where: { id }
  });
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  deleteContact
};
