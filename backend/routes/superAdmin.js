const express = require('express');
const router = express.Router();
const superAdminProtect = require('../middleware/superAdminAuth');
const { uploadPayment } = require('../middleware/upload');
const {
  login,
  getDashboard,
  getUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  resetUserPassword,
  getBusinesses,
  getBusinessDetails,
  updateBusinessStatus,
  deleteBusiness,
  getAnalytics,
  getModerationContent,
  deleteContent,
  getSettings,
  updateSettings,
  getActivityLogs,
  getMe,
} = require('../controllers/superAdminController');

const {
  getSubscriptions,
  getUserSubscription,
  assignPlan,
  extendSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionStats,
  getPlans,
  updatePlan,
} = require('../controllers/subscriptionController');

const {
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
} = require('../controllers/subscriptionRequestController');

const {
  bulkBlockUsers,
  bulkUnblockUsers,
  bulkDeleteUsers,
  bulkAssignPlan,
} = require('../controllers/bulkActionController');

const {
  exportUsers,
  exportBusinesses,
  exportSubscriptions,
} = require('../controllers/exportController');

const {
  getAllTickets,
  getTicket,
  adminReplyToTicket,
  updateTicketStatus,
  updateTicketPriority,
  getTicketStats,
} = require('../controllers/supportTicketController');

// Public
router.post('/login', login);

// Protected - SuperAdmin only
router.get('/me', superAdminProtect, getMe);
router.get('/dashboard', superAdminProtect, getDashboard);

// Users
router.get('/users', superAdminProtect, getUsers);
router.get('/users/:id', superAdminProtect, getUserDetails);
router.patch('/users/:id/status', superAdminProtect, updateUserStatus);
router.patch('/users/:id/password', superAdminProtect, resetUserPassword);
router.delete('/users/:id', superAdminProtect, deleteUser);

// Bulk Actions
router.post('/users/bulk/block', superAdminProtect, bulkBlockUsers);
router.post('/users/bulk/unblock', superAdminProtect, bulkUnblockUsers);
router.post('/users/bulk/delete', superAdminProtect, bulkDeleteUsers);
router.post('/users/bulk/assign-plan', superAdminProtect, bulkAssignPlan);

// Export
router.post('/export/users', superAdminProtect, exportUsers);
router.post('/export/businesses', superAdminProtect, exportBusinesses);
router.post('/export/subscriptions', superAdminProtect, exportSubscriptions);

// Businesses
router.get('/businesses', superAdminProtect, getBusinesses);
router.get('/businesses/:id', superAdminProtect, getBusinessDetails);
router.patch('/businesses/:id/status', superAdminProtect, updateBusinessStatus);
router.delete('/businesses/:id', superAdminProtect, deleteBusiness);

// Analytics
router.get('/analytics', superAdminProtect, getAnalytics);

// Moderation
router.get('/moderation', superAdminProtect, getModerationContent);
router.delete('/moderation/:type/:id', superAdminProtect, deleteContent);

// Settings
router.get('/settings', superAdminProtect, getSettings);
router.put('/settings', superAdminProtect, uploadPayment, updateSettings);

// Subscriptions
router.get('/subscriptions', superAdminProtect, getSubscriptions);
router.get('/subscriptions/stats', superAdminProtect, getSubscriptionStats);
router.get('/subscriptions/plans', superAdminProtect, getPlans);
router.put('/subscriptions/plans/:id', superAdminProtect, updatePlan);
router.get('/subscriptions/:userId', superAdminProtect, getUserSubscription);
router.patch('/subscriptions/:userId/assign', superAdminProtect, assignPlan);
router.patch('/subscriptions/:userId/extend', superAdminProtect, extendSubscription);
router.patch('/subscriptions/:userId/cancel', superAdminProtect, cancelSubscription);
router.patch('/subscriptions/:userId/reactivate', superAdminProtect, reactivateSubscription);

// Subscription Requests (manual/request-based upgrade flow)
router.get('/subscription-requests', superAdminProtect, getAllRequests);
router.get('/subscription-requests/:id', superAdminProtect, getRequestById);
router.patch('/subscription-requests/:id/approve', superAdminProtect, approveRequest);
router.patch('/subscription-requests/:id/reject', superAdminProtect, rejectRequest);

// Support Tickets
router.get('/support/tickets', superAdminProtect, getAllTickets);
router.get('/support/tickets/stats', superAdminProtect, getTicketStats);
router.get('/support/tickets/:id', superAdminProtect, getTicket);
router.post('/support/tickets/:id/reply', superAdminProtect, adminReplyToTicket);
router.patch('/support/tickets/:id/status', superAdminProtect, updateTicketStatus);
router.patch('/support/tickets/:id/priority', superAdminProtect, updateTicketPriority);

// Activity Logs
router.get('/activity-logs', superAdminProtect, getActivityLogs);

module.exports = router;
