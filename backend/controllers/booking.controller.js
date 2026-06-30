const { Booking } = require('../models');
const { Op } = require('sequelize');
const { getSequelize } = require('../config/database');
const { logActivity } = require('../utils/logger');
const PDFDocument = require('pdfkit');

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
    try {
        const BookingModel = Booking();
        const booking = await BookingModel.create(req.body);
        await logActivity(req, 'Bookings', `Created booking for ${booking.client_name}`, { title: 'New Booking', type: 'success' });
        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
exports.getBookings = async (req, res, next) => {
    try {
        const BookingModel = Booking();
        
        let order = [['createdAt', 'DESC']];
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
                { client_name: { [Op.like]: `%${req.query.search}%` } },
                { email: { [Op.like]: `%${req.query.search}%` } },
                { booking_id: { [Op.like]: `%${req.query.search}%` } }
            ];
        }
        
        if (req.query.status) where.booking_status = req.query.status;
        if (req.query.payment) where.payment_status = req.query.payment;
        if (req.query.type) where.consultation_type = req.query.type;
        if (req.query.consultant) where.consultant = req.query.consultant;
        if (req.query.mode) where.meeting_mode = req.query.mode;

        const { count, rows } = await BookingModel.findAndCountAll({
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
    try {
        const BookingModel = Booking();
        const booking = await BookingModel.findByPk(req.params.id);

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
exports.updateBooking = async (req, res, next) => {
    try {
        const BookingModel = Booking();
        let booking = await BookingModel.findByPk(req.params.id);

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking = await booking.update(req.body);
        await logActivity(req, 'Bookings', `Updated booking ${booking.booking_id}`);
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
exports.deleteBooking = async (req, res, next) => {
    try {
        const BookingModel = Booking();
        const booking = await BookingModel.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        await booking.destroy();
        await logActivity(req, 'Bookings', `Deleted booking ${booking.booking_id}`, { title: 'Booking Deleted', type: 'warning' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Update status (Approve, Reject, Cancel)
// @route   PATCH /api/bookings/:id/status
exports.updateStatus = async (req, res, next) => {
    try {
        const BookingModel = Booking();
        const booking = await BookingModel.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        await booking.update({ booking_status: req.body.status });
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

// @desc    Reschedule booking
// @route   PATCH /api/bookings/:id/reschedule
exports.rescheduleBooking = async (req, res, next) => {
    try {
        const BookingModel = Booking();
        const booking = await BookingModel.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        await booking.update({ 
            booking_date: req.body.date, 
            booking_time: req.body.time,
            booking_status: 'Rescheduled'
        });
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

// @desc    Get booking analytics
// @route   GET /api/bookings/analytics
exports.getAnalytics = async (req, res, next) => {
    try {
        const BookingModel = Booking();
        const sequelize = getSequelize();
        
        // 1. Revenue
        const revenue = await BookingModel.sum('amount', { where: { payment_status: 'Paid' } }) || 0;
        
        // 2. Today's Bookings
        const todayStr = new Date().toISOString().slice(0, 10);
        const todaysBookings = await BookingModel.count({ where: { booking_date: todayStr } });
        
        // 3. Upcoming Bookings
        const upcomingBookings = await BookingModel.count({ 
            where: { 
                booking_date: { [Op.gt]: todayStr },
                booking_status: { [Op.in]: ['Confirmed', 'Upcoming', 'Rescheduled'] }
            } 
        });

        // Additional Stats for dashboard cards
        const totalBookings = await BookingModel.count();
        const confirmedBookings = await BookingModel.count({ where: { booking_status: 'Confirmed' } });
        const pendingApprovalBookings = await BookingModel.count({ where: { booking_status: 'Pending' } });
        const completedBookings = await BookingModel.count({ where: { booking_status: 'Completed' } });
        const cancelledBookings = await BookingModel.count({ where: { booking_status: 'Cancelled' } });

        // 4. Bookings Per Month
        const monthlyBookings = await BookingModel.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['year', 'month'],
            order: [['year', 'ASC'], ['month', 'ASC']]
        }).then(res => res.map(r => ({
            _id: { month: r.get('month'), year: r.get('year') },
            count: r.get('count')
        })));

        // 5. Booking Status Distribution
        const statusDistribution = await BookingModel.findAll({
            attributes: [
                'booking_status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['booking_status']
        }).then(res => res.map(r => ({
            status: r.get('booking_status'),
            count: r.get('count')
        })));

        // 6. Consultation Categories
        const categoryDistribution = await BookingModel.findAll({
            attributes: [
                'consultation_type',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['consultation_type']
        }).then(res => res.map(r => ({
            category: r.get('consultation_type'),
            count: r.get('count')
        })));

        // 7. Revenue Generated (Per Month)
        const revenueByMonth = await BookingModel.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            where: { payment_status: 'Paid' },
            group: ['year', 'month'],
            order: [['year', 'ASC'], ['month', 'ASC']]
        }).then(res => res.map(r => ({
            _id: { month: r.get('month'), year: r.get('year') },
            total: r.get('total')
        })));

        res.status(200).json({
            success: true,
            data: {
                revenue,
                totalBookings,
                todaysBookings,
                upcomingBookings,
                confirmedBookings,
                pendingApprovalBookings,
                completedBookings,
                cancelledBookings,
                monthlyBookings,
                statusDistribution,
                categoryDistribution,
                revenueByMonth
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate Invoice PDF for a Booking
// @route   GET /api/bookings/:id/invoice
exports.generateInvoice = async (req, res, next) => {
    try {
        const BookingModel = Booking();
        const booking = await BookingModel.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const doc = new PDFDocument({ margin: 50 });
        res.header('Content-Type', 'application/pdf');
        res.attachment(`Invoice_${booking.booking_id}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'right' });
        doc.fontSize(10).font('Helvetica').text('Sarangi Consulting', { align: 'left' })
           .text('123 Business Avenue, Suite 100', { align: 'left' })
           .text('New Delhi, India', { align: 'left' })
           .text('Email: billing@sarangiconsulting.com', { align: 'left' });
        
        doc.moveDown(2);

        // Invoice Details
        doc.fontSize(12).font('Helvetica-Bold').text('Invoice To:', { align: 'left' });
        doc.font('Helvetica').text(`Client Name: ${booking.client_name}`);
        if (booking.company) doc.text(`Company: ${booking.company}`);
        doc.text(`Email: ${booking.email}`);
        doc.text(`Phone: ${booking.phone}`);
        
        doc.moveUp(4);
        doc.font('Helvetica-Bold').text(`Invoice Number: INV-${booking.booking_id}`, { align: 'right' });
        doc.font('Helvetica').text(`Date: ${new Date().toISOString().slice(0, 10)}`, { align: 'right' });
        doc.text(`Booking Status: ${booking.booking_status}`, { align: 'right' });
        doc.text(`Payment Status: ${booking.payment_status}`, { align: 'right' });

        doc.moveDown(3);

        // Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Description', 50, tableTop);
        doc.text('Consultant', 250, tableTop);
        doc.text('Amount', 450, tableTop, { align: 'right' });
        
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Row
        const row1 = tableTop + 25;
        doc.font('Helvetica');
        doc.text(`${booking.consultation_type} - ${booking.meeting_mode}`, 50, row1);
        doc.text(booking.consultant, 250, row1);
        doc.text(`Rs. ${parseFloat(booking.amount || 0).toFixed(2)}`, 450, row1, { align: 'right' });

        doc.moveTo(50, row1 + 20).lineTo(550, row1 + 20).stroke();

        // Totals
        const totalTop = row1 + 35;
        doc.text('Subtotal:', 350, totalTop);
        doc.text(`Rs. ${parseFloat(booking.amount || 0).toFixed(2)}`, 450, totalTop, { align: 'right' });

        doc.text('Discount:', 350, totalTop + 20);
        doc.text(`Rs. ${parseFloat(booking.discount || 0).toFixed(2)}`, 450, totalTop + 20, { align: 'right' });

        doc.text('GST:', 350, totalTop + 40);
        doc.text(`Rs. ${parseFloat(booking.gst || 0).toFixed(2)}`, 450, totalTop + 40, { align: 'right' });

        const total = parseFloat(booking.amount || 0) - parseFloat(booking.discount || 0) + parseFloat(booking.gst || 0);
        doc.font('Helvetica-Bold').text('Total:', 350, totalTop + 60);
        doc.text(`Rs. ${total.toFixed(2)}`, 450, totalTop + 60, { align: 'right' });

        doc.moveDown(4);
        doc.font('Helvetica').fontSize(10).text('Thank you for your business!', { align: 'center' });

        doc.end();
    } catch (error) {
        next(error);
    }
};
