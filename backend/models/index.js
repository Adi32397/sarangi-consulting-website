const { initUser, getUser } = require('./User');
const { initLead, getLead } = require('./Lead');
const { initBooking, getBooking } = require('./Booking');
const { initBanner, getBanner } = require('./Banner');
const { initSetting, getSetting } = require('./Setting');
const { initActivityLog, getActivityLog } = require('./ActivityLog');
const { initNotification, getNotification } = require('./Notification');
const { initPricingCard, PricingCard: getPricingCard } = require('./PricingCard');
const { getSequelize } = require('../config/database');

const syncDatabase = async () => {
    // 1. Initialize models
    const User = initUser();
    const Lead = initLead();
    const Booking = initBooking();
    const Banner = initBanner();
    const Setting = initSetting();
    const ActivityLog = initActivityLog();
    const Notification = initNotification();
    initPricingCard();


    // 2. Define relationships (if any, in the future)
    // Removed Lead-User relationship to store consultant names directly

    // 3. Sync database tables
    const sequelize = getSequelize();
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
};

module.exports = {
    syncDatabase,
    User: () => getUser(),
    Lead: () => getLead(),
    Booking: () => getBooking(),
    Banner: () => getBanner(),
    Setting: () => getSetting(),
    ActivityLog: () => getActivityLog(),
    Notification: () => getNotification(),
    PricingCard: () => getPricingCard()
};
