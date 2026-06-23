const prisma = require('../../config/prisma');

const getBanners = async () => {
  return await prisma.banner.findMany({
    where: { status: 'active' }
  });
};

module.exports = {
  getBanners
};
