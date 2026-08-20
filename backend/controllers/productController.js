const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');
const Business = require('../models/Business');
const { checkPlanLimit } = require('../utils/subscriptionUtils');

// Helper to get business by userId
const getBusinessId = async (userId) => {
  const business = await Business.findOne({ userId });

  if (!business) {
    throw new Error('Business not found');
  }

  return business._id;
};

// Upload image buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    console.log('☁️  Uploading product image to Cloudinary...');
    
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'bizcardly/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary error:', error);
          console.error('   Code:', error.http_code);
          console.error('   Message:', error.message);
          
          if (error.http_code === 401 || error.http_code === 403) {
            reject(new Error('Cloudinary authentication failed - invalid credentials'));
          } else if (error.message?.includes('too large')) {
            reject(new Error('File size too large for Cloudinary'));
          } else {
            reject(new Error(`Cloudinary error: ${error.message}`));
          }
        } else {
          console.log('✅ Cloudinary upload successful');
          console.log('   URL:', result.secure_url);
          resolve(result);
        }
      }
    );

    stream.on('error', (error) => {
      console.error('❌ Stream error:', error);
      reject(new Error(`Upload stream error: ${error.message}`));
    });

    stream.end(fileBuffer);
  });
};

// @desc   Create product
// @route  POST /api/products
// @access Private
exports.createProduct = async (req, res) => {
  try {
    console.log('📦 Creating product...');
    
    const businessId = await getBusinessId(req.user._id);
    console.log(`🏢 Business ID: ${businessId}`);

    const currentCount = await Product.countDocuments({ businessId });
    const limitCheck = await checkPlanLimit(req.user._id, 'product', currentCount);
    if (!limitCheck.allowed) {
      return res.status(403).json({ success: false, message: limitCheck.message, limitReached: true });
    }

    const { name, description, price, category, status } = req.body;

    if (!name) {
      console.error('❌ Product name missing');
      return res.status(400).json({
        success: false,
        message: 'Product name is required',
      });
    }

    let image = '';

    // Upload image to Cloudinary
    if (req.file) {
      console.log(`📸 Processing image: ${req.file.originalname} (${req.file.size} bytes)`);
      const result = await uploadToCloudinary(req.file.buffer);
      image = result.secure_url;
    }

    console.log(`📝 Creating product: ${name}, Price: ${price}`);

    const product = await Product.create({
      businessId,
      name,
      description: description || '',
      price: parseFloat(price) || 0,
      category: category || '',
      status: status || 'active',
      image,
    });

    console.log(`✅ Product created successfully: ${product._id}`);

    res.status(201).json({
      success: true,
      message: 'Product created',
      product,
    });
  } catch (error) {
    console.error('❌ Create product error:', error.message);
    console.error('Stack trace:', error.stack);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc   Get all products for business
// @route  GET /api/products
// @access Private
exports.getProducts = async (req, res) => {
  try {
    console.log('📥 Fetching products...');
    
    const businessId = await getBusinessId(req.user._id);
    console.log(`🏢 Business ID: ${businessId}`);

    const products = await Product.find({
      businessId,
    }).sort({ createdAt: -1 });

    console.log(`✅ Found ${products.length} product(s)`);
    
    if (products.length > 0) {
      products.forEach((product, idx) => {
        console.log(`  ${idx + 1}. ${product.name} - Image: ${product.image ? '✓' : '✗'}`);
      });
    }

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('❌ Get products error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc   Update product
// @route  PUT /api/products/:id
// @access Private
exports.updateProduct = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);

    const product = await Product.findOne({
      _id: req.params.id,
      businessId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const { name, description, price, category, status } = req.body;

    if (name) {
      product.name = name;
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (price !== undefined) {
      product.price = parseFloat(price) || 0;
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (status !== undefined) {
      product.status = status;
    }

    // Upload new image to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      product.image = result.secure_url;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc   Delete product
// @route  DELETE /api/products/:id
// @access Private
exports.deleteProduct = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      businessId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    console.error('Delete product error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};