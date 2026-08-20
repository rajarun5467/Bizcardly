/**
 * Comprehensive setup/migration script:
 * 1. Connects to MongoDB
 * 2. Seeds default plans (Free, Pro)
 * 3. Ensures every user has a Subscription record
 * 4. Ensures PlatformSetting document exists
 * 5. Ensures SuperAdmin user exists
 * 6. Creates indexes on all collections
 *
 * Usage: node migrate-setup.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./models/User');
const Business = require('./models/Business');
const Product = require('./models/Product');
const Service = require('./models/Service');
const Gallery = require('./models/Gallery');
const Video = require('./models/Video');
const Visitor = require('./models/Visitor');
const ActivityLog = require('./models/ActivityLog');
const PlatformSetting = require('./models/PlatformSetting');
const SupportTicket = require('./models/SupportTicket');
const { Subscription, Plan } = require('./models/Subscription');
const SubscriptionRequest = require('./models/SubscriptionRequest');
const { ensureSubscription, seedDefaultPlans } = require('./utils/subscriptionUtils');

const run = async () => {
  try {
    console.log('🚀 Starting comprehensive setup/migration...\n');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Seed default plans
    console.log('📋 Step 1: Seeding default plans...');
    await seedDefaultPlans();
    const planCount = await Plan.countDocuments();
    console.log(`   ✅ Plans in DB: ${planCount}\n`);

    // 2. Ensure PlatformSetting exists
    console.log('⚙️  Step 2: Ensuring PlatformSetting document exists...');
    let settings = await PlatformSetting.findOne();
    if (!settings) {
      settings = await PlatformSetting.create({});
      console.log('   ✅ Created default PlatformSetting');
    } else {
      console.log('   ✅ PlatformSetting already exists');
    }
    console.log(`   - paymentQrCode: ${settings.paymentQrCode ? 'Set' : 'Not set'}`);
    console.log(`   - paymentUpiId: ${settings.paymentUpiId || 'Not set'}\n`);

    // 3. Ensure SuperAdmin user exists
    console.log('👤 Step 3: Ensuring SuperAdmin user exists...');
    const adminEmail = 'admin@bizcardly.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123456', salt);
      admin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'superadmin',
      });
      console.log('   ✅ Created SuperAdmin user');
    } else {
      console.log('   ✅ SuperAdmin user already exists');
    }
    console.log(`   - Email: ${admin.email}\n`);

    // 4. Ensure every user has a Subscription record
    console.log('📦 Step 4: Ensuring all users have Subscription records...');
    const users = await User.find({}).select('_id name email role');
    console.log(`   Found ${users.length} user(s)`);
    let created = 0;
    let skipped = 0;
    for (const user of users) {
      const existing = await Subscription.findOne({ userId: user._id });
      if (existing) {
        skipped += 1;
        continue;
      }
      await ensureSubscription(user._id);
      created += 1;
      console.log(`   ✅ Created Free subscription for ${user.name} (${user.email})`);
    }
    console.log(`   ✅ Created: ${created}, Already had: ${skipped}\n`);

    // 5. Create indexes by touching all models
    console.log('📇 Step 5: Ensuring all collections and indexes exist...');
    await Promise.all([
      User.init(),
      Business.init(),
      Product.init(),
      Service.init(),
      Gallery.init(),
      Video.init(),
      Visitor.init(),
      ActivityLog.init(),
      PlatformSetting.init(),
      SupportTicket.init(),
      Subscription.init(),
      Plan.init(),
      SubscriptionRequest.init(),
    ]);
    console.log('   ✅ All collections initialized with indexes\n');

    // 6. Summary
    console.log('📊 Database Summary:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Collections: ${collections.length}`);
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`   - ${col.name}: ${count} documents`);
    }

    console.log('\n✅ Setup/migration complete!\n');
  } catch (error) {
    console.error('❌ Setup/migration failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
