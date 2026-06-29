const { Notification } = require('../models');

// @desc    Get all notifications (latest first)
// @route   GET /api/notifications
// @access  Private (Admin)
exports.getNotifications = async (req, res, next) => {
    try {
        const NotificationModel = Notification();
        const notifications = await NotificationModel.findAll({
            order: [['created_at', 'DESC']],
            limit: 50 // Limit to last 50 for performance
        });

        const unreadCount = await NotificationModel.count({ where: { is_read: false } });

        res.status(200).json({
            success: true,
            unreadCount,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notifications as read
// @route   PATCH /api/notifications/read
// @access  Private (Admin)
exports.markAsRead = async (req, res, next) => {
    try {
        const NotificationModel = Notification();
        
        if (req.body.id) {
            // Mark specific notification as read
            await NotificationModel.update({ is_read: true }, { where: { id: req.body.id } });
        } else {
            // Mark all as read
            await NotificationModel.update({ is_read: true }, { where: { is_read: false } });
        }

        res.status(200).json({
            success: true,
            message: 'Notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};
