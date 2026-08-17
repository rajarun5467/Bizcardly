const Business = require('../models/Business');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');
const Video = require('../models/Video');
const slugify = require('slugify');

// Generate unique slug
const generateUniqueSlug = async (name, excludeId = null) => {
  let slug = slugify(name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  let query = { slug };
  if (excludeId) query._id = { $ne: excludeId };
  let exists = await Business.findOne(query);
  if (exists) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }
  return slug;
};

// @desc   Get own business
// @route  GET /api/business
// @access Private
exports.getBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    res.json({ success: true, business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update business profile
// @route  PUT /api/business
// @access Private
exports.updateBusiness = async (req, res) => {
  try {
    let business = await Business.findOne({ userId: req.user._id });
    
    if (!business) {
      // Create new business if doesn't exist
      const {
        name, businessName, category, tagline, about, description, phone, whatsapp,
        email, website, address, mapUrl, openingHours, isPublished,
      } = req.body;

      const finalName = name || businessName || 'My Business';
      const slug = await generateUniqueSlug(finalName);

      business = new Business({
        userId: req.user._id,
        name: finalName,
        businessName: finalName,
        slug: slug,
        category: category || '',
        tagline: tagline || '',
        description: description || '',
        about: about || '',
        phone: phone || '',
        whatsapp: whatsapp || '',
        email: email || '',
        website: website || '',
        address: address || '',
        mapUrl: mapUrl || '',
        openingHours: openingHours || '',
        isPublished: isPublished || false,
      });

      // Handle file uploads for new business
      if (req.files) {
        if (req.files.logo) business.logo = `/uploads/${req.files.logo[0].filename}`;
        if (req.files.profileImage) business.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
        if (req.files.paymentQR) business.paymentQR = `/uploads/${req.files.paymentQR[0].filename}`;
      }
      if (req.file) {
        business.logo = `/uploads/${req.file.filename}`;
      }

      await business.save();
      return res.status(201).json({ success: true, message: 'Business created successfully', business });
    }

    const {
      businessName, name, category, tagline, about, description, phone, whatsapp,
      email, website, address, mapUrl, openingHours, isPublished,
      'socialLinks.instagram': instagram,
      'socialLinks.facebook': facebook,
      'socialLinks.youtube': youtube,
      'socialLinks.linkedin': linkedin,
      'socialLinks.twitter': twitter,
      'socialLinks.whatsapp': socialWhatsapp,
      'socialLinks.website': socialWebsite,
    } = req.body;

    // Update fields - support both naming conventions
    const finalName = name || businessName;
    if (finalName) {
      const oldName = business.name;
      business.name = finalName;
      business.businessName = finalName;
      // Regenerate slug if name changed
      if (finalName !== oldName) {
        business.slug = await generateUniqueSlug(finalName, business._id);
      }
    }
    if (category !== undefined) business.category = category;
    if (tagline !== undefined) business.tagline = tagline;
    if (description !== undefined) business.description = description;
    if (about !== undefined) business.about = about;
    if (phone !== undefined) business.phone = phone;
    if (whatsapp !== undefined) business.whatsapp = whatsapp;
    if (email !== undefined) business.email = email;
    if (website !== undefined) business.website = website;
    if (address !== undefined) business.address = address;
    if (mapUrl !== undefined) business.mapUrl = mapUrl;
    if (openingHours !== undefined) business.openingHours = openingHours;
    if (isPublished !== undefined) business.isPublished = isPublished;

    // Parse socialLinks from body
    const socialLinksData = {};
    try {
      if (req.body.socialLinks) {
        const parsed = typeof req.body.socialLinks === 'string'
          ? JSON.parse(req.body.socialLinks)
          : req.body.socialLinks;
        Object.assign(socialLinksData, parsed);
      }
    } catch (e) {}

    if (instagram !== undefined) socialLinksData.instagram = instagram;
    if (facebook !== undefined) socialLinksData.facebook = facebook;
    if (youtube !== undefined) socialLinksData.youtube = youtube;
    if (linkedin !== undefined) socialLinksData.linkedin = linkedin;
    if (twitter !== undefined) socialLinksData.twitter = twitter;
    if (socialWebsite !== undefined) socialLinksData.website = socialWebsite;
    if (socialWhatsapp !== undefined) socialLinksData.whatsapp = socialWhatsapp;

    if (Object.keys(socialLinksData).length > 0) {
      business.socialLinks = { ...business.socialLinks?.toObject() || {}, ...socialLinksData };
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.logo) business.logo = `/uploads/${req.files.logo[0].filename}`;
      if (req.files.profileImage) business.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
      if (req.files.paymentQR) business.paymentQR = `/uploads/${req.files.paymentQR[0].filename}`;
    }
    if (req.file) {
      business.logo = `/uploads/${req.file.filename}`;
    }

    await business.save();
    res.json({ success: true, message: 'Business updated successfully', business });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update social links
// @route  PUT /api/business/social
// @access Private
exports.updateSocialLinks = async (req, res) => {
  try {
    console.log('Update social links request body:', req.body);
    let business = await Business.findOne({ userId: req.user._id });
    
    if (!business) {
      console.log('Business not found, creating new business for social links');
      // Create new business if doesn't exist
      business = new Business({ userId: req.user._id });
      await business.save();
    }


    const existingSocialLinks =
      business.socialLinks &&
      typeof business.socialLinks.toObject === 'function'
        ? business.socialLinks.toObject()
        : business.socialLinks || {};

    business.socialLinks = {
      ...existingSocialLinks,
      ...req.body
    };

    await business.save();
    console.log('Updated social links:', business.socialLinks);
    console.log('Social links saved successfully');
    res.json({ success: true, message: 'Social links updated', business });
  } catch (error) {
    console.error('Update social links error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update payment details
// @route  PUT /api/business/payment
// @access Private
exports.updatePayment = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (req.body.upiId) business.upiId = req.body.upiId;
    if (req.file) business.paymentQr = `/uploads/${req.file.filename}`;
    
    await business.save();
    res.json({ success: true, message: 'Payment details updated', business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update location
// @route  PUT /api/business/location
// @access Private
exports.updateLocation = async (req, res) => {
  try {
    let business = await Business.findOne({ userId: req.user._id });

    if (!business) {
      const baseName = req.user?.name || 'My Business';
      const slug = await generateUniqueSlug(baseName);
      business = new Business({
        userId: req.user._id,
        businessName: `${baseName}'s Business`,
        name: baseName,
        slug,
      });
    }

    const nextLocation = {
      latitude: req.body.latitude ?? business.location?.latitude ?? '',
      longitude: req.body.longitude ?? business.location?.longitude ?? '',
      mapUrl: req.body.mapUrl ?? business.location?.mapUrl ?? '',
    };

    business.location = {
      ...(business.location && typeof business.location.toObject === 'function'
        ? business.location.toObject()
        : business.location || {}),
      ...nextLocation,
    };

    await business.save();
    res.json({ success: true, message: 'Location updated', business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get public business profile by slug
// @route  GET /api/business/:slug
// @access Public
exports.getPublicBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug, isPublished: true });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Fetch all associated data
    const [products, services, gallery, videos] = await Promise.all([
      Product.find({ businessId: business._id, status: 'active' }),
      Service.find({ businessId: business._id, status: 'active' }),
      Gallery.find({ businessId: business._id }).sort({ createdAt: -1 }),
      Video.find({ businessId: business._id }).sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      business,
      products,
      services,
      gallery,
      videos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
