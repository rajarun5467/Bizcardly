/**
 * One-off migration script: guarantees every existing User has a Subscription record.
 * Safe to run multiple times (skips users that already have one).
 *
 * Usage: node migrate-ensure-subscriptions.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./models/User');
const { Subscription } = require('./models/Subscription');
const { ensureSubscription, seedDefaultPlans } = require('./utils/subscriptionUtils');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await seedDefaultPlans();

    const users = await User.find({}).select('_id name email');
    console.log(`🔍 Found ${users.length} user(s). Checking subscriptions...`);

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
      console.log(`  ✅ Created Free subscription for ${user.name} (${user.email})`);
    }

    console.log(`\n✅ Migration complete. Created: ${created}, Already had subscription: ${skipped}`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
