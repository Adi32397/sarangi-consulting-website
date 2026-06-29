const { Setting, ActivityLog } = require('../models');

// @desc    Get all settings grouped by key
// @route   GET /api/settings
exports.getSettings = async (req, res, next) => {
    try {
        const SettingModel = Setting();
        const settings = await SettingModel.findAll();
        
        // Transform array of rows into a single key-value object
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.group_key] = s.value;
        });

        res.status(200).json({ success: true, data: settingsObj });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a specific setting group
// @route   PUT /api/settings/:group
exports.updateSettingsGroup = async (req, res, next) => {
    try {
        const group_key = req.params.group;
        const SettingModel = Setting();
        
        // Upsert the setting
        let setting = await SettingModel.findOne({ where: { group_key } });
        
        if (setting) {
            setting.value = req.body;
            await setting.save();
        } else {
            setting = await SettingModel.create({
                group_key,
                value: req.body
            });
        }
        
        // Log the activity
        const ActivityLogModel = ActivityLog();
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const browser = req.headers['user-agent'] || 'Unknown';
        
        await ActivityLogModel.create({
            user_id: req.user ? req.user.name : 'Admin',
            module: 'Settings',
            action: `Updated ${group_key} settings`,
            ip_address: ip,
            browser: browser.substring(0, 50),
            status: 'Success'
        });

        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        next(error);
    }
};

// @desc    Get activity logs
// @route   GET /api/settings/logs
exports.getActivityLogs = async (req, res, next) => {
    try {
        const ActivityLogModel = ActivityLog();
        const logs = await ActivityLogModel.findAll({
            order: [['created_at', 'DESC']],
            limit: 50
        });
        
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        next(error);
    }
};
