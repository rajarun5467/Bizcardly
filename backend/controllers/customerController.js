const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc   Register a customer (pending approval)
// @route  POST /api/customers/register
// @access Public
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, mobile, password, confirmPassword } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, mobile and password' });
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingCustomer = await Customer.findOne({ mobile });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }

    const customer = await Customer.create({ name, email, mobile, password });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending admin approval.',
      customer: { id: customer._id, name: customer.name, mobile: customer.mobile, isApproved: customer.isApproved },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Login customer with mobile number
// @route  POST /api/customers/login
// @access Public
exports.loginCustomer = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ success: false, message: 'Please provide mobile and password' });
    }

    const customer = await Customer.findOne({ mobile }).select('+password');
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid mobile or password' });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid mobile or password' });
    }

    if (!customer.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. Please wait for superadmin approval.',
        isApproved: false,
      });
    }

    const token = generateToken(customer._id, customer.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      customer: { id: customer._id, name: customer.name, mobile: customer.mobile, email: customer.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all customers for superadmin
// @route  GET /api/customers
// @access SuperAdmin
exports.getCustomers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status === 'pending') filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;

    const customers = await Customer.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Approve customer
// @route  PATCH /api/customers/:id/approve
// @access SuperAdmin
exports.approveCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.isApproved = true;
    customer.approvedAt = new Date();
    await customer.save();

    res.json({
      success: true,
      message: `${customer.name} has been approved successfully`,
      customer: { id: customer._id, name: customer.name, mobile: customer.mobile, isApproved: customer.isApproved },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete customer
// @route  DELETE /api/customers/:id
// @access SuperAdmin
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await Customer.deleteOne({ _id: customer._id });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
