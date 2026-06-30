const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    uploadImage,
    generateQR,
    getBannerStats
} = require('../controllers/banner.controller');

const { protect } = require('../middlewares/auth.middleware');
const { validate, validateBanner } = require('../middlewares/validation.middleware');

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `banner-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter(req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images only!'));
        }
    }
});

router.post('/upload', protect, upload.single('image'), uploadImage);
router.post('/generate-qr', protect, generateQR);

router.get('/stats', protect, getBannerStats);

router.route('/')
    .get(getBanners) // Public to retrieve active banners for frontend
    .post(protect, validateBanner, validate, createBanner);

router.route('/:id')
    .put(protect, validateBanner, validate, updateBanner)
    .delete(protect, deleteBanner);

module.exports = router;
