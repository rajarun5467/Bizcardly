const { Subscription, Plan } = require('../models/Subscription');

// Default plans used to seed the DB (single source of truth is the Plan collection).
const DEFAULT_PLANS = [
  {
    name: 'Free',
    price: 0,
    billingDuration: 'free',
    limits: {
      productLimit: 5,
      serviceLimit: 5,
      galleryImageLimit: 10,
      videoLimit: 2,
      customFeatures: [],
    },
    isActive: true,
  },
  {
    name: 'Pro',
    price: 299,
    billingDuration: 'monthly',
    limits: {
      productLimit: 100,
      serviceLimit: 100,
      galleryImageLimit: 200,
      videoLimit: 50,
      customFeatures: ['remove_branding', 'priority_support', 'custom_templates', 'advanced_analytics'],
    },
    isActive: true,
  },
];

const RESOURCE_LIMIT_KEY = {
  product: 'productLimit',
  service: 'serviceLimit',
  gallery: 'galleryImageLimit',
  video: 'videoLimit',
};

let planCache = null;
let planCacheAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

// Create default plans in DB if they don't already exist. Safe to call multiple times.
const seedDefaultPlans = async () => {
  for (const p of DEFAULT_PLANS) {
    const exists = await Plan.findOne({ name: p.name });
    if (!exists) {
      await Plan.create(p);
      console.log(`✅ Seeded default plan: ${p.name}`);
    }
  }
};

const invalidatePlanCache = () => {
  planCache = null;
  planCacheAt = 0;
};

// Returns all plans from DB (source of truth), seeding defaults if the collection is empty.
const getAllPlans = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && planCache && now - planCacheAt < CACHE_TTL_MS) {
    return planCache;
  }

  let plans = await Plan.find({}).sort({ price: 1 }).lean();
  if (plans.length === 0) {
    await seedDefaultPlans();
    plans = await Plan.find({}).sort({ price: 1 }).lean();
  }

  planCache = plans;
  planCacheAt = now;
  return plans;
};

const getPlan = async (planName) => {
  const plans = await getAllPlans();
  return plans.find((p) => p.name === planName) || plans.find((p) => p.name === 'Free');
};

// Ensures every user has a Subscription record. Also handles automatic expiry:
// if a Pro subscription's expiryDate has passed, it is downgraded to Free/expired.
const ensureSubscription = async (userId) => {
  let sub = await Subscription.findOne({ userId });

  if (!sub) {
    sub = await Subscription.create({
      userId,
      plan: 'Free',
      status: 'active',
      startDate: new Date(),
    });
    return sub;
  }

  const now = new Date();
  if (sub.plan !== 'Free' && sub.status === 'active' && sub.expiryDate && sub.expiryDate < now) {
    sub.status = 'expired';
    sub.plan = 'Free';
    sub.expiryDate = null;
    await sub.save();
  }

  return sub;
};

const getSubscriptionWithLimits = async (userId) => {
  const subscription = await ensureSubscription(userId);
  const plan = await getPlan(subscription.plan);
  return { subscription, plan, limits: plan.limits || {} };
};

// Checks whether a user is allowed to create one more resource of the given type.
// currentCount = number of that resource the user already has.
const checkPlanLimit = async (userId, resourceType, currentCount) => {
  const limitKey = RESOURCE_LIMIT_KEY[resourceType];
  if (!limitKey) return { allowed: true };

  const { plan } = await getSubscriptionWithLimits(userId);
  const limit = plan?.limits?.[limitKey];

  // null/undefined or negative limit = unlimited
  if (limit == null || limit < 0) return { allowed: true, limit, planName: plan.name };

  if (currentCount >= limit) {
    return {
      allowed: false,
      limit,
      planName: plan.name,
      message: `Your ${plan.name} plan ${resourceType} limit (${limit}) has been reached. Upgrade to Pro to add more ${resourceType}s.`,
    };
  }

  return { allowed: true, limit, planName: plan.name };
};

// Checks whether a user's active plan includes a given custom feature.
const hasFeature = async (userId, featureName) => {
  const { subscription, plan } = await getSubscriptionWithLimits(userId);
  if (subscription.status !== 'active') return false;
  return (plan.limits?.customFeatures || []).includes(featureName);
};

module.exports = {
  DEFAULT_PLANS,
  RESOURCE_LIMIT_KEY,
  seedDefaultPlans,
  invalidatePlanCache,
  getAllPlans,
  getPlan,
  ensureSubscription,
  getSubscriptionWithLimits,
  checkPlanLimit,
  hasFeature,
};
