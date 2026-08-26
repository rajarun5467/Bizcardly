const express = require('express');
const router = express.Router();
const superAdminProtect = require('../middleware/superAdminAuth');
const {
  registerCustomer,
  loginCustomer,
  getCustomers,
  approveCustomer,
  deleteCustomer,
} = require('../controllers/customerController');

// Public customer auth
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// SuperAdmin only
router.get('/', superAdminProtect, getCustomers);
router.patch('/:id/approve', superAdminProtect, approveCustomer);
router.delete('/:id', superAdminProtect, deleteCustomer);

module.exports = router;
