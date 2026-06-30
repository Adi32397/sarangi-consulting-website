const prisma = require('../../config/prisma');

const getServices = async () => {
  return await prisma.service.findMany({
    where: { status: 'active' }
  });
};

const getServiceBySlug = async (slug) => {
  return await prisma.service.findUnique({
    where: { slug }
  });
};

module.exports = {
  getServices,
  getServiceBySlug
};
