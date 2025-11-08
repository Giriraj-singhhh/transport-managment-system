const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const Notification = require('../models/Notification');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId, validatePagination } = require('../middleware/validation');

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { isRead, type, includeExpired } = req.query;
    
    const options = {
      isRead: isRead !== undefined ? isRead === 'true' : null,
      type,
      limit,
      skip,
      includeExpired: includeExpired === 'true'
    };

    const notifications = await Notification.findUserNotifications(req.user._id, options);
    const total = await Notification.countDocuments({ userId: req.user._id });
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications'
    });
  }
});

// @route   GET /api/notifications/:id
// @desc    Get notification by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    // Check if user can access this notification
    if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notification'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    // Check if user can access this notification
    if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    await notification.markAsRead();

    res.json({
      status: 'success',
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as read'
    });
  }
});

// @route   PUT /api/notifications/:id/unread
// @desc    Mark notification as unread
// @access  Private
router.put('/:id/unread', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    // Check if user can access this notification
    if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    await notification.markAsUnread();

    res.json({
      status: 'success',
      message: 'Notification marked as unread'
    });
  } catch (error) {
    console.error('Mark notification as unread error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as unread'
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);

    res.json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark all notifications as read'
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      status: 'success',
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch unread count'
    });
  }
});

// @route   POST /api/notifications
// @desc    Create notification (Admin only)
// @access  Private (Admin)
router.post('/', authenticateToken, authorize('admin'), [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('type')
    .isIn(['booking', 'cancellation', 'schedule_change', 'delay', 'payment', 'system', 'promotion'])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message is required and must be less than 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('actionUrl')
    .optional()
    .isURL()
    .withMessage('Action URL must be a valid URL'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { userId, type, title, message, priority, data, actionUrl } = req.body;

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      priority: priority || 'medium',
      data: data || {},
      actionUrl
    });

    res.status(201).json({
      status: 'success',
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create notification'
    });
  }
});

// @route   POST /api/notifications/bulk
// @desc    Create bulk notifications (Admin only)
// @access  Private (Admin)
router.post('/bulk', authenticateToken, authorize('admin'), [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('User IDs array is required'),
  body('userIds.*')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('type')
    .isIn(['booking', 'cancellation', 'schedule_change', 'delay', 'payment', 'system', 'promotion'])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message is required and must be less than 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { userIds, type, title, message, priority, data, actionUrl } = req.body;

    const notificationData = {
      type,
      title,
      message,
      priority: priority || 'medium',
      data: data || {},
      actionUrl
    };

    const notifications = await Notification.sendToMultipleUsers(userIds, notificationData);

    res.status(201).json({
      status: 'success',
      message: 'Bulk notifications created successfully',
      data: { 
        notifications,
        count: notifications.length
      }
    });
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create bulk notifications'
    });
  }
});

// @route   POST /api/notifications/by-role
// @desc    Send notifications to users by role (Admin only)
// @access  Private (Admin)
router.post('/by-role', authenticateToken, authorize('admin'), [
  body('role')
    .isIn(['student', 'staff', 'admin', 'driver'])
    .withMessage('Valid role is required'),
  body('type')
    .isIn(['booking', 'cancellation', 'schedule_change', 'delay', 'payment', 'system', 'promotion'])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message is required and must be less than 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { role, type, title, message, priority, data, actionUrl } = req.body;

    const notificationData = {
      type,
      title,
      message,
      priority: priority || 'medium',
      data: data || {},
      actionUrl
    };

    const notifications = await Notification.sendToUsersByRole(role, notificationData);

    res.status(201).json({
      status: 'success',
      message: `Notifications sent to all ${role}s successfully`,
      data: { 
        notifications,
        count: notifications.length,
        role
      }
    });
  } catch (error) {
    console.error('Send notifications by role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send notifications by role'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    // Check if user can delete this notification
    if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete notification'
    });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', authenticateToken, authorize('admin'), [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Notification.getStats(start, end);

    res.json({
      status: 'success',
      data: {
        stats,
        period: { startDate: start, endDate: end }
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notification statistics'
    });
  }
});

module.exports = router;
