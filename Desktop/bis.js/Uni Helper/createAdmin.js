const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to DB...');

        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (adminExists) {
            console.log('Admin already exists!');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

        await User.create({
            name: 'Super Admin',
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Admin created successfully!');
        console.log(`Email: ${process.env.ADMIN_EMAIL}`);
        console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
        process.exit(0);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createAdmin();