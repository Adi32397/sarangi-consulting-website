require('dotenv').config();
const { getSequelize, connectDB } = require('./config/database');
const { initUser } = require('./models/User');

const seedUsers = async () => {
    await connectDB();
    const User = initUser();
    const sequelize = getSequelize();
    await sequelize.sync();

    const consultants = [
        { name: 'Aditya', email: 'aditya@sarangi.com', role: 'Super Admin' },
        { name: 'Admin', email: 'admin@sarangi.com', role: 'Admin' },
        { name: 'priya', email: 'priya@sarangi.com', role: 'Manager' },
        { name: 'samuel', email: 'samuel@sarangi.com', role: 'Viewer' }
    ];

    for (let c of consultants) {
        const existing = await User.findOne({ where: { name: c.name } });
        if (!existing) {
            await User.create({
                name: c.name,
                email: c.email,
                password: 'password123',
                role: c.role
            });
            console.log(`Created user: ${c.name}`);
        } else {
            console.log(`User already exists: ${c.name}`);
        }
    }
    process.exit(0);
};
seedUsers().catch(err => {
    console.error(err);
    process.exit(1);
});
