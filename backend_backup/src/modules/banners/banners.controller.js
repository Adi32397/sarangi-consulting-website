const bannersService = require('./banners.service');

const getBanners = async (req, res, next) => {
  try {
    const banners = await bannersService.getBanners();
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners
};
