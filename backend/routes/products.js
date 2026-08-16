const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const protect = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.post('/', protect, uploadSingle, createProduct);
router.get('/', protect, getProducts);
router.put('/:id', protect, uploadSingle, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
