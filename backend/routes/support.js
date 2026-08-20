const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createTicket,
  getMyTickets,
  getMyTicket,
  replyToTicket,
} = require('../controllers/supportTicketController');

router.post('/', protect, createTicket);
router.get('/', protect, getMyTickets);
router.get('/:id', protect, getMyTicket);
router.post('/:id/reply', protect, replyToTicket);

module.exports = router;
