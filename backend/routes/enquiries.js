const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { submitEnquiry, getEnquiries, updateEnquiryStatus, deleteEnquiry } = require('../controllers/enquiryController');

router.post('/:businessId', submitEnquiry); // Public - submit enquiry
router.get('/', protect, getEnquiries); // Private - get enquiries for business owner
router.put('/:id/status', protect, updateEnquiryStatus); // Private - update status
router.delete('/:id', protect, deleteEnquiry); // Private - delete an enquiry

module.exports = router;
