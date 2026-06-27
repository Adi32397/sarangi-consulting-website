const express = require('express');
const bannersController = require('./banners.controller');

const router = express.Router();

router.get('/', bannersController.getBanners);

module.exports = router;
