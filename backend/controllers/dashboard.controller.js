const { Lead, Booking, Banner, User } = require('../models');
const { Op, fn, col } = require('sequelize');
const { getSequelize } = require('../config/database');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const sequelize = getSequelize();
        const LeadModel = Lead();
        const BookingModel = Booking();
        const BannerModel = Banner();
        const UserModel = User();

        // 1. CARDS
        // Total Leads
        const totalLeads = await LeadModel.count();
        
        // New Leads (created this month)
        const date = new Date();
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const newLeads = await LeadModel.count({
            where: {
                createdAt: {
                    [Op.gte]: firstDayOfMonth
                }
            }
        });

        // Bookings (Total)
        const totalBookings = await BookingModel.count();

        // Revenue (Sum of amount where payment_status is 'paid' or just all amounts)
        // Let's sum all amounts for demonstration, or we can use payment_status if it exists
        const revenueResult = await BookingModel.sum('amount');
        const revenue = revenueResult || 0;

        // Active Banners
        const activeBanners = await BannerModel.count({
            where: { status: 'Active' }
        });

        // Users
        const totalUsers = await UserModel.count();

        // 2. CHARTS

        // a. Monthly Leads (Count grouped by month)
        const leadsMonthlyRaw = await LeadModel.findAll({
            attributes: [
                [fn('MONTH', col('createdAt')), 'month'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: [fn('MONTH', col('createdAt'))],
            raw: true
        });

        // b. Monthly Bookings (Count grouped by month)
        const bookingsMonthlyRaw = await BookingModel.findAll({
            attributes: [
                [fn('MONTH', col('createdAt')), 'month'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: [fn('MONTH', col('createdAt'))],
            raw: true
        });

        // c. Monthly Revenue (Sum of amount grouped by month)
        const revenueMonthlyRaw = await BookingModel.findAll({
            attributes: [
                [fn('MONTH', col('createdAt')), 'month'],
                [fn('SUM', col('amount')), 'total']
            ],
            group: [fn('MONTH', col('createdAt'))],
            raw: true
        });

        // d. Lead Sources
        const leadSourcesRaw = await LeadModel.findAll({
            attributes: [
                'leadSource',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['leadSource'],
            raw: true
        });

        // e. Booking Status
        const bookingStatusRaw = await BookingModel.findAll({
            attributes: [
                'booking_status',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['booking_status'],
            raw: true
        });

        // f. Banner Views (Top 5 banners)
        const bannerViewsRaw = await BannerModel.findAll({
            attributes: ['title', 'views'],
            order: [['views', 'DESC']],
            limit: 5,
            raw: true
        });

        // Format helpers
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const formatMonthlyData = (rawArray, valueKey) => {
            const labels = [];
            const data = [];
            // Initialize 12 months with 0
            const months = Array(12).fill(0);
            rawArray.forEach(row => {
                if (row.month) {
                    months[row.month - 1] = parseFloat(row[valueKey]) || 0;
                }
            });
            // We can return all 12 months or just up to current month.
            // Let's return all 12 months for simplicity
            months.forEach((val, i) => {
                labels.push(monthNames[i]);
                data.push(val);
            });
            return { labels, data };
        };

        const formatCategoricalData = (rawArray, labelKey, valueKey) => {
            return {
                labels: rawArray.map(r => r[labelKey] || 'Unknown'),
                data: rawArray.map(r => parseFloat(r[valueKey]) || 0)
            };
        };

        res.status(200).json({
            success: true,
            cards: {
                totalLeads,
                newLeads,
                totalBookings,
                revenue,
                activeBanners,
                totalUsers
            },
            charts: {
                monthlyLeads: formatMonthlyData(leadsMonthlyRaw, 'count'),
                monthlyBookings: formatMonthlyData(bookingsMonthlyRaw, 'count'),
                monthlyRevenue: formatMonthlyData(revenueMonthlyRaw, 'total'),
                leadSources: formatCategoricalData(leadSourcesRaw, 'leadSource', 'count'),
                bookingStatus: formatCategoricalData(bookingStatusRaw, 'booking_status', 'count'),
                bannerViews: formatCategoricalData(bannerViewsRaw, 'title', 'views')
            }
        });
    } catch (error) {
        next(error);
    }
};
