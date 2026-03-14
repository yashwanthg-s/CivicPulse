const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');

// Middleware to verify token (basic implementation)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // In production, verify JWT token here
  // For now, just pass through
  next();
};

// Resolution notification routes (for citizens when complaints are resolved) - MUST come first
router.get('/resolution', verifyToken, NotificationController.getResolutionNotifications);
router.patch('/resolution/:id/read', verifyToken, NotificationController.markResolutionNotificationAsRead);

// Officer notification routes - MUST come before generic routes
router.get('/officer', verifyToken, NotificationController.getOfficerNotifications);
router.patch('/officer/:id/read', verifyToken, NotificationController.markOfficerNotificationAsRead);
router.post('/officer/mark-all-read', verifyToken, NotificationController.markAllOfficerNotificationsAsRead);

// Category-based notification routes (new complaints in officer's categories)
router.get('/category', verifyToken, NotificationController.getCategoryBasedNotifications);
router.put('/category/:complaintId/read', verifyToken, NotificationController.markCategoryNotificationAsRead);
router.put('/category/mark-all-read', verifyToken, NotificationController.markAllCategoryNotificationsAsRead);

// Generic notification routes - MUST come last
router.get('/', verifyToken, NotificationController.getNotifications);
router.patch('/:id/read', verifyToken, NotificationController.markAsRead);
router.post('/mark-all-read', verifyToken, NotificationController.markAllAsRead);

module.exports = router;
