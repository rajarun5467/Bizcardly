const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('./subscriptionController');
const { hasFeature } = require('../utils/subscriptionUtils');

// ===== User Side =====

exports.createTicket = async (req, res) => {
  try {
    const { category, subject, description } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ success: false, message: 'Category, subject, and description are required' });
    }

    const isPriority = await hasFeature(req.user._id, 'priority_support');

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      category,
      subject,
      description,
      priority: isPriority ? 'High' : 'Medium',
      isPriority,
      messages: [{
        senderId: req.user._id,
        senderRole: 'user',
        senderName: req.user.name,
        message: description,
      }],
      lastReplyBy: 'user',
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: 'ticket_created',
      targetType: 'ticket',
      targetId: ticket._id,
      description: `${req.user.name} created a support ticket: ${subject}`,
    });

    res.status(201).json({ success: true, message: 'Ticket created successfully', ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-messages')
      .lean();

    res.json({
      success: true,
      tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replyToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (ticket.status === 'Closed' || ticket.status === 'Resolved') {
      return res.status(400).json({ success: false, message: 'Cannot reply to a closed or resolved ticket' });
    }

    ticket.messages.push({
      senderId: req.user._id,
      senderRole: 'user',
      senderName: req.user.name,
      message: message.trim(),
    });
    ticket.lastReplyBy = 'user';
    if (ticket.status === 'Waiting for User') {
      ticket.status = 'In Progress';
    }
    await ticket.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: 'ticket_replied',
      targetType: 'ticket',
      targetId: ticket._id,
      description: `${req.user.name} replied to ticket ${ticket.ticketId}`,
    });

    res.json({ success: true, message: 'Reply added', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== SuperAdmin Side =====

exports.getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, status, category, priority } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (priority && priority !== 'all') filter.priority = priority;

    if (search) {
      filter.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-messages')
      .lean();

    res.json({
      success: true,
      tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminReplyToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    ticket.messages.push({
      senderId: req.user._id,
      senderRole: 'superadmin',
      senderName: req.user.name,
      message: message.trim(),
    });
    ticket.lastReplyBy = 'superadmin';
    if (ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }
    await ticket.save();

    await logActivity(
      req.user._id, req.user.name, 'ticket_replied', 'ticket', ticket._id,
      `SuperAdmin ${req.user.name} replied to ticket ${ticket.ticketId}: ${ticket.subject}`
    );

    res.json({ success: true, message: 'Reply added', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Waiting for User', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    const action = status === 'Closed' ? 'ticket_closed' : 'ticket_status_changed';
    await logActivity(
      req.user._id, req.user.name, action, 'ticket', ticket._id,
      `SuperAdmin ${req.user.name} changed ticket ${ticket.ticketId} status from ${oldStatus} to ${status}`
    );

    res.json({ success: true, message: `Status updated to ${status}`, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTicketPriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const oldPriority = ticket.priority;
    ticket.priority = priority;
    await ticket.save();

    await logActivity(
      req.user._id, req.user.name, 'ticket_priority_changed', 'ticket', ticket._id,
      `SuperAdmin ${req.user.name} changed ticket ${ticket.ticketId} priority from ${oldPriority} to ${priority}`
    );

    res.json({ success: true, message: `Priority updated to ${priority}`, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const [openTickets, highPriority, urgent, total] = await Promise.all([
      SupportTicket.countDocuments({ status: 'Open' }),
      SupportTicket.countDocuments({ priority: 'High', status: { $in: ['Open', 'In Progress'] } }),
      SupportTicket.countDocuments({ priority: 'Urgent', status: { $in: ['Open', 'In Progress'] } }),
      SupportTicket.countDocuments(),
    ]);

    res.json({ success: true, stats: { openTickets, highPriority, urgent, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
