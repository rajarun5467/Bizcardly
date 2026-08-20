/**
 * SuperAdmin Seed Script
 * 
 * Usage: node seed-superadmin.js
 * 
 * Creates the first SuperAdmin account.
 * Change the credentials below before running in production.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const SUPERADMIN_NAME = 'Super Admin';
const SUPERADMIN_EMAIL = 'admin@bizcardly.com';
const SUPERADMIN_PASSWORD = 'Admin@123456';

const seedSuperAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB');

    // Check if superadmin already exists
    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) {
      console.log('SuperAdmin already exists:', existing.email);
      console.log('If you want to create a new one, delete the existing superadmin first.');
      process.exit(0);
    }

    // Check if email is already taken
    const emailExists = await User.findOne({ email: SUPERADMIN_EMAIL });
    if (emailExists) {
      console.log('Email already registered. Updating role to superadmin...');
      emailExists.role = 'superadmin';
      emailExists.isBlocked = false;
      await emailExists.save();
      console.log('User updated to SuperAdmin:', emailExists.email);
      process.exit(0);
    }

    // Create superadmin
    const superadmin = await User.create({
      name: SUPERADMIN_NAME,
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      role: 'superadmin',
    });

    console.log('========================================');
    console.log('SuperAdmin created successfully!');
    console.log('========================================');
    console.log('Name:     ', superadmin.name);
    console.log('Email:    ', superadmin.email);
    console.log('Password: ', SUPERADMIN_PASSWORD);
    console.log('========================================');
    console.log('Login at: /superadmin/login');
    console.log('========================================');
    console.log('IMPORTANT: Change the password after first login!');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
