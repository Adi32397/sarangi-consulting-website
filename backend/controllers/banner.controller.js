const { Banner } = require('../models');
const { Op } = require('sequelize');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { logActivity } = require('../utils/logger');

// @desc    Create new banner
// @route   POST /api/banners
exports.createBanner = async (req, res, next) => {
    try {
        const BannerModel = Banner();
        
        // Ensure start_date and end_date are null if empty string
        const body = { ...req.body };
        if (!body.start_date) body.start_date = null;
        if (!body.end_date) body.end_date = null;
        
        const banner = await BannerModel.create(body);
        await logActivity(req, 'Banners', `Created banner ${banner.title}`, { title: 'New Banner', type: 'success' });
        res.status(201).json({ success: true, data: banner });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all banners
// @route   GET /api/banners
exports.getBanners = async (req, res, next) => {
    try {
        const BannerModel = Banner();
        
        let order = [['priority', 'ASC'], ['createdAt', 'DESC']];
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',');
            order = sortBy.map(s => {
                if (s.startsWith('-')) return [s.substring(1), 'DESC'];
                return [s, 'ASC'];
            });
        }
        
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const where = {};
        
        if (req.query.search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${req.query.search}%` } },
                { subtitle: { [Op.like]: `%${req.query.search}%` } }
            ];
        }
        
        if (req.query.status) where.status = req.query.status;
        if (req.query.type) where.banner_type = req.query.type;

        const { count, rows } = await BannerModel.findAndCountAll({
            where,
            order,
            limit,
            offset
        });
        
        res.status(200).json({ 
            success: true, 
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
exports.updateBanner = async (req, res, next) => {
    try {
        const BannerModel = Banner();
        let banner = await BannerModel.findByPk(req.params.id);

        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

        const body = { ...req.body };
        if (body.start_date === '') body.start_date = null;
        if (body.end_date === '') body.end_date = null;

        banner = await banner.update(body);
        await logActivity(req, 'Banners', `Updated banner ${banner.title}`);
        res.status(200).json({ success: true, data: banner });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
exports.deleteBanner = async (req, res, next) => {
    try {
        const BannerModel = Banner();
        const banner = await BannerModel.findByPk(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

        // Optionally delete the image file from server if it's local
        if (banner.image && banner.image.startsWith('/uploads/')) {
            const filepath = path.join(__dirname, '..', banner.image);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }

        await banner.destroy();
        await logActivity(req, 'Banners', `Deleted banner ${banner.title}`);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload banner image
// @route   POST /api/banners/upload
exports.uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }
        // Return the path so frontend can save it to DB
        const imagePath = `/uploads/${req.file.filename}`;
        await logActivity(req, 'Banners', `Uploaded banner image ${req.file.filename}`);
        res.status(200).json({ success: true, data: imagePath });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate QR Code
// @route   POST /api/banners/generate-qr
exports.generateQR = async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, message: 'Please provide a URL' });
        
        // Generate QR code as Base64 Data URI
        const qrCodeDataUri = await QRCode.toDataURL(url);
        
        res.status(200).json({ success: true, data: qrCodeDataUri });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Banner Stats for Dashboard
// @route   GET /api/banners/stats
exports.getBannerStats = async (req, res, next) => {
    try {
        const BannerModel = Banner();
        const { fn, col } = require('sequelize');

        // Summary Counts
        const total = await BannerModel.count();
        const active = await BannerModel.count({ where: { status: 'Active' } });
        const scheduled = await BannerModel.count({ where: { status: 'Scheduled' } });
        const expired = await BannerModel.count({ where: { status: 'Expired' } });
        const draft = await BannerModel.count({ where: { status: 'Draft' } });
        
        // QR Campaigns (qr_code is not null)
        const qrCampaigns = await BannerModel.count({
            where: { qr_code: { [Op.ne]: null } }
        });

        // Overall Analytics
        const totalViews = await BannerModel.sum('views') || 0;
        const totalClicks = await BannerModel.sum('clicks') || 0;
        const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;
        
        const topPerformingBanner = await BannerModel.findOne({
            order: [['clicks', 'DESC']]
        });
        const topPerforming = topPerformingBanner ? topPerformingBanner.title : 'N/A';

        // Monthly Banner Views (mock aggregate using createdAt month)
        const viewsByMonthRaw = await BannerModel.findAll({
            attributes: [
                [fn('MONTH', col('createdAt')), 'month'],
                [fn('SUM', col('views')), 'total_views']
            ],
            group: [fn('MONTH', col('createdAt'))],
            raw: true
        });

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyViews = Array(12).fill(0);
        viewsByMonthRaw.forEach(row => {
            if (row.month) {
                monthlyViews[row.month - 1] = parseInt(row.total_views, 10) || 0;
            }
        });
        
        // Since we want dynamic labels up to current month (or all 12)
        // Let's just return the full 12 months data
        const viewsChartData = {
            labels: monthNames,
            data: monthlyViews
        };

        // Top 4 Banners by Clicks for Clicks Chart
        const clicksChartRaw = await BannerModel.findAll({
            attributes: ['title', 'clicks'],
            order: [['clicks', 'DESC']],
            limit: 4,
            raw: true
        });
        const clicksChartData = {
            labels: clicksChartRaw.map(b => b.title),
            data: clicksChartRaw.map(b => b.clicks)
        };

        // Status Distribution
        const statusRaw = await BannerModel.findAll({
            attributes: ['status', [fn('COUNT', col('id')), 'count']],
            group: ['status'],
            raw: true
        });
        const statusChartData = {
            labels: statusRaw.map(s => s.status),
            data: statusRaw.map(s => s.count)
        };

        // Type Distribution
        const typeRaw = await BannerModel.findAll({
            attributes: ['banner_type', [fn('COUNT', col('id')), 'count']],
            group: ['banner_type'],
            raw: true
        });
        const typeChartData = {
            labels: typeRaw.map(t => t.banner_type),
            data: typeRaw.map(t => t.count)
        };

        res.status(200).json({
            success: true,
            data: {
                counts: { total, active, scheduled, expired, draft, qrCampaigns },
                analytics: { totalViews, totalClicks, avgCtr, topPerforming },
                charts: { viewsChartData, clicksChartData, statusChartData, typeChartData }
            }
        });
    } catch (error) {
        next(error);
    }
};
