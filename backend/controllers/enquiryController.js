const Enquiry = require('../models/Enquiry');
const Business = require('../models/Business');

// @desc   Submit an enquiry for a business (public)
// @route  POST /api/enquiries/:businessId
// @access Public
exports.submitEnquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const { businessId } = req.params;

    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Name, phone, and message are required.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const enquiry = await Enquiry.create({
      businessId: business._id,
      name,
      email: email || '',
      phone,
      subject: subject || '',
      message,
    });

    res.status(201).json({ success: true, enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all enquiries for the logged-in user's business
// @route  GET /api/enquiries
// @access Private
exports.getEnquiries = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const enquiries = await Enquiry.find({ businessId: business._id }).sort({ createdAt: -1 });
    res.json({ success: true, enquiries, count: enquiries.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update enquiry status
// @route  PUT /api/enquiries/:id/status
// @access Private
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const enquiry = await Enquiry.findOne({ _id: req.params.id, businessId: business._id });
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    enquiry.status = status || enquiry.status;
    await enquiry.save();
    res.json({ success: true, enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete an enquiry
// @route  DELETE /api/enquiries/:id
// @access Private
exports.deleteEnquiry = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const enquiry = await Enquiry.findOne({ _id: req.params.id, businessId: business._id });
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    await enquiry.deleteOne();
    res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
