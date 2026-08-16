const Product = require('../models/Product');
const Business = require('../models/Business');

// Helper to get business by userId
const getBusinessId = async (userId) => {
  const business = await Business.findOne({ userId });
  if (!business) throw new Error('Business not found');
  return business._id;
};

// @desc   Create product
// @route  POST /api/products
// @access Private
exports.createProduct = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const { name, description, price, category, status } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Product name is required' });

    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const product = await Product.create({
      businessId,
      name,
      description: description || '',
      price: parseFloat(price) || 0,
      category: category || '',
      status: status || 'active',
      image,
    });

    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all products for business
// @route  GET /api/products
// @access Private
exports.getProducts = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const products = await Product.find({ businessId }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update product
// @route  PUT /api/products/:id
// @access Private
exports.updateProduct = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const product = await Product.findOne({ _id: req.params.id, businessId });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { name, description, price, category, status } = req.body;
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price) || 0;
    if (category !== undefined) product.category = category;
    if (status !== undefined) product.status = status;
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    res.json({ success: true, message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete product
// @route  DELETE /api/products/:id
// @access Private
exports.deleteProduct = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const product = await Product.findOneAndDelete({ _id: req.params.id, businessId });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
