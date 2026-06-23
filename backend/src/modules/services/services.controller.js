const servicesService = require('./services.service');

const getServices = async (req, res, next) => {
  try {
    const services = await servicesService.getServices();
    res.json(services);
  } catch (error) {
    next(error);
  }
};

const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await servicesService.getServiceBySlug(req.params.slug);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceBySlug
};
