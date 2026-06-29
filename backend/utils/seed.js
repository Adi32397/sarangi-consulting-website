require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding');

        const existingAdmin = await User.findOne({ email: 'superadmin@sarangiconsulting.com' });
        
        if (existingAdmin) {
            console.log('Super Admin already exists');
        } else {
            const superAdmin = new User({
                name: 'Super Admin',
                email: 'superadmin@sarangiconsulting.com',
                password: 'superadmin123',
                phone: '1234567890',
                role: 'Super Admin',
                status: 'active'
            });

            await superAdmin.save();
            console.log('Super Admin account created successfully');
            console.log('Email: superadmin@sarangiconsulting.com');
            console.log('Password: superadmin123');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedSuperAdmin();
