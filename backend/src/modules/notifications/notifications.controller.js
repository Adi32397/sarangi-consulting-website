const notificationsService = require('./notifications.service');

const getNotifications = async (req, res, next) => {
  try {
    const notifications =
      await notificationsService.getNotifications();

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications
};