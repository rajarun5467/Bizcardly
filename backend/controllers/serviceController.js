const Service = require('../models/Service');
const Business = require('../models/Business');

// Helper to get business by userId
const getBusinessId = async (userId) => {
  const business = await Business.findOne({ userId });
  if (!business) throw new Error('Business not found');
  return business._id;
};

// @desc   Create service
// @route  POST /api/services
// @access Private
exports.createService = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const { name, description, price, category, status } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Service name is required' });

    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const service = await Service.create({
      businessId,
      name,
      description: description || '',
      price: parseFloat(price) || 0,
      category: category || '',
      status: status || 'active',
      image,
    });

    res.status(201).json({ success: true, message: 'Service created', service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all services for business
// @route  GET /api/services
// @access Private
exports.getServices = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const services = await Service.find({ businessId }).sort({ createdAt: -1 });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update service
// @route  PUT /api/services/:id
// @access Private
exports.updateService = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const service = await Service.findOne({ _id: req.params.id, businessId });

    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const { name, description, price, category, status } = req.body;
    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = parseFloat(price) || 0;
    if (category !== undefined) service.category = category;
    if (status !== undefined) service.status = status;
    if (req.file) service.image = `/uploads/${req.file.filename}`;

    await service.save();
    res.json({ success: true, message: 'Service updated', service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete service
// @route  DELETE /api/services/:id
// @access Private
exports.deleteService = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const service = await Service.findOneAndDelete({ _id: req.params.id, businessId });

    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
