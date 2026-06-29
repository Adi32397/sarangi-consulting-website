const express = require('express');
const { exportCSV, exportExcel, exportPDF } = require('../controllers/export.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/:module/csv', exportCSV);
router.post('/:module/excel', exportExcel);
router.post('/:module/pdf', exportPDF);

module.exports = router;
