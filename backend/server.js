const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🚀 Starting Bizcardly Server...');
console.log('📋 Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
});

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const productRoutes = require('./routes/products');
const serviceRoutes = require('./routes/services');
const galleryRoutes = require('./routes/gallery');
const videoRoutes = require('./routes/videos');
const visitorRoutes = require('./routes/visitors');

// Connect to MongoDB
if (typeof connectDB === 'function') {
  connectDB().catch((error) => {
    console.error('Startup database connection failed:', error.message);
  });
} else {
  console.error('connectDB is not a function, check db.js exports');
}

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['https://bizcardly.vercel.app', 'https://www.bizcardly.vercel.app', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static files - serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/visitors', visitorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Bizcardly API is running 🚀' });
});

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bizcardly Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      business: {
        get: 'GET /api/business',
        create: 'POST /api/business',
        update: 'PUT /api/business',
        public: 'GET /api/business/public/:slug'
      },
      products: {
        get: 'GET /api/products',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      services: {
        get: 'GET /api/services',
        create: 'POST /api/services',
        update: 'PUT /api/services/:id',
        delete: 'DELETE /api/services/:id'
      },
      gallery: {
        get: 'GET /api/gallery',
        create: 'POST /api/gallery',
        delete: 'DELETE /api/gallery/:id'
      },
      videos: {
        get: 'GET /api/videos',
        create: 'POST /api/videos',
        delete: 'DELETE /api/videos/:id'
      },
      social: {
        get: 'GET /api/social',
        create: 'POST /api/social',
        update: 'PUT /api/social'
      },
      payment: {
        get: 'GET /api/payment',
        create: 'POST /api/payment',
        update: 'PUT /api/payment'
      },
      location: {
        get: 'GET /api/location',
        create: 'POST /api/location',
        update: 'PUT /api/location'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bizcardly Server running on port ${PORT}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
  process.exit(1);
});