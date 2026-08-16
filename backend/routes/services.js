const express = require('express');
const router = express.Router();
const { createService, getServices, updateService, deleteService } = require('../controllers/serviceController');
const protect = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.post('/', protect, uploadSingle, createService);
router.get('/', protect, getServices);
router.put('/:id', protect, uploadSingle, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
