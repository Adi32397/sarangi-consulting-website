const { ActivityLog, Notification } = require('../models');

/**
 * Log activity and optionally create a notification
 * @param {Object} req - Express request object
 * @param {String} module - Module name (e.g. 'Leads', 'Auth')
 * @param {String} action - Action description (e.g. 'Created a new lead')
 * @param {Object} notificationOpts - { title, message, type } to also create a notification
 */
exports.logActivity = async (req, moduleName, action, notificationOpts = null) => {
    try {
        const ActivityLogModel = ActivityLog();
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const browser = req.headers['user-agent'] || 'Unknown';
        const user_id = req.user ? req.user.name : 'Admin';

        // 1. Log Activity
        await ActivityLogModel.create({
            user_id,
            module: moduleName,
            action,
            ip_address: ip,
            browser: browser.substring(0, 50),
            status: 'Success'
        });

        // 2. Create Notification if requested
        if (notificationOpts) {
            const NotificationModel = Notification();
            await NotificationModel.create({
                title: notificationOpts.title,
                message: notificationOpts.message || action,
                type: notificationOpts.type || 'info'
            });
        }
    } catch (err) {
        console.error('Logger Error:', err);
    }
};
