const express = require('express');
const servicesController = require('./services.controller');

const router = express.Router();

router.get('/', servicesController.getServices);
router.get('/:slug', servicesController.getServiceBySlug);

module.exports = router;
