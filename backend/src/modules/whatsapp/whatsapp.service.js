const prisma = require('../../config/prisma');

const logClick = async (data) => {
  return await prisma.whatsAppClick.create({
    data: {
      page: data.page,
      service: data.service || null
    }
  });
};

const getClicks = async () => {
  return await prisma.whatsAppClick.findMany({
    orderBy: { created_at: 'desc' }
  });
};

module.exports = {
  logClick,
  getClicks
};
