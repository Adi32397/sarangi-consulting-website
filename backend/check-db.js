require('dotenv').config();
const { getSequelize, connectDB } = require('./config/database');
const { initUser } = require('./models/User');

const check = async () => {
    await connectDB();
    const User = initUser();
    const users = await User.scope('withPassword').findAll();
    users.forEach(u => console.log(u.email, u.password));
    process.exit(0);
};

check().catch(console.error);
