/**
 * SuperAdmin Seed Script - TEST DATABASE
 * 
 * Seeds the bizcardly_test database with a SuperAdmin account.
 * Does NOT touch the production database.
 * 
 * Usage: node seed-superadmin.test.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.test') });
const mongoose = require('mongoose');
const User = require('./models/User');

const SUPERADMIN_NAME = 'Super Admin';
const SUPERADMIN_EMAIL = 'admin@bizcardly.com';
const SUPERADMIN_PASSWORD = 'Admin@123456';

const seedSuperAdmin = async () => {
  try {
    console.log('🧪 Connecting to TEST MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('🧪 Connected to TEST MongoDB');

    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) {
      console.log('🧪 SuperAdmin already exists in test DB:', existing.email);
      process.exit(0);
    }

    const emailExists = await User.findOne({ email: SUPERADMIN_EMAIL });
    if (emailExists) {
      console.log('🧪 Email exists in test DB, updating role to superadmin...');
      emailExists.role = 'superadmin';
      emailExists.isBlocked = false;
      await emailExists.save();
      console.log('🧪 User updated to SuperAdmin:', emailExists.email);
      process.exit(0);
    }

    const superadmin = await User.create({
      name: SUPERADMIN_NAME,
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      role: 'superadmin',
    });

    console.log('========================================');
    console.log('🧪 SuperAdmin created in TEST DB!');
    console.log('========================================');
    console.log('Name:     ', superadmin.name);
    console.log('Email:    ', superadmin.email);
    console.log('Password: ', SUPERADMIN_PASSWORD);
    console.log('========================================');
    process.exit(0);
  } catch (error) {
    console.error('🧪 Seed error:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
