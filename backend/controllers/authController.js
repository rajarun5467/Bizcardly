const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const slugify = require('slugify');

// Generate JWT Token
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate unique slug
const generateUniqueSlug = async (name) => {
  let slug = slugify(name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  let exists = await Business.findOne({ slug });
  if (exists) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }
  return slug;
};

// @desc   Register new user
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  try {
    await ensureDbConnection();
    console.log('Register request body:', req.body);
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    console.log('Creating user...');
    const user = await User.create({ name, email, password });
    console.log('User created:', user._id);

    // Create blank business profile with slug
    console.log('Creating business profile...');
    const slug = await generateUniqueSlug(name);
    console.log('Generated slug:', slug);
    
    const business = await Business.create({
      userId: user._id,
      businessName: name + "'s Business",
      slug,
    });
    console.log('Business created:', business._id);

    const token = generateToken(user._id, user.email);
    console.log('Token generated');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    await ensureDbConnection();
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user with password
    console.log('Finding user:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log('Comparing password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.email);
    console.log('Login successful for:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  try {
    await ensureDbConnection();
    const user = req.user;
    const business = await Business.findOne({ userId: user._id });

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      business,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update password
// @route  PUT /api/auth/password
// @access Private
exports.updatePassword = async (req, res) => {
  try {
    await ensureDbConnection();
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
