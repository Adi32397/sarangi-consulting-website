const prisma = require('../../config/prisma');

const getNotifications = async () => {
  return await prisma.notification.findMany({
    orderBy: {
      created_at: 'desc'
    }
  });
};

module.exports = {
  getNotifications
};