const whatsappService = require('./whatsapp.service');

const logClick = async (req, res, next) => {
  try {
    const { page, service } = req.body;
    if (!page) {
      return res.status(400).json({ message: 'Page is required' });
    }
    const click = await whatsappService.logClick({ page, service });
    res.status(201).json(click);
  } catch (error) {
    next(error);
  }
};

const getClicks = async (req, res, next) => {
  try {
    const clicks = await whatsappService.getClicks();
    res.json(clicks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logClick,
  getClicks
};
