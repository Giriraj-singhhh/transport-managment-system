const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors, validatePagination } = require('../middleware/validation');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: 'active' });
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ status: 'active' });
    const totalRoutes = await Route.countDocuments();
    const activeRoutes = await Route.countDocuments({ status: 'active' });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    // Get today's data
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const todayRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'firstName lastName email')
      .populate('busId', 'busNumber name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalBuses,
          activeBuses,
          totalDrivers,
          activeDrivers,
          totalRoutes,
          activeRoutes,
          totalBookings,
          confirmedBookings
        },
        today: {
          bookings: todayBookings,
          revenue: todayRevenue[0]?.total || 0
        },
        recentBookings,
        usersByRole,
        bookingsByStatus,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data'
    });
  }
});

// @route   GET /api/admin/reports/bookings
// @desc    Generate booking report
// @access  Private (Admin)
router.get('/reports/bookings', authenticateToken, authorize('admin'), [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const bookings = await Booking.find({
      createdAt: { $gte: start, $lte: end }
    })
    .populate('userId', 'firstName lastName email role')
    .populate('busId', 'busNumber name')
    .populate('scheduleId', 'departureTime arrivalTime')
    .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Booking ID,User Name,User Email,User Role,Bus Number,Bus Name,Seat Number,Travel Date,Amount,Status,Payment Status,Created At\n';
      const csvRows = bookings.map(booking => 
        `${booking._id},${booking.userId.firstName} ${booking.userId.lastName},${booking.userId.email},${booking.userId.role},${booking.busId.busNumber},${booking.busId.name},${booking.seatNumber},${booking.travelDate.toISOString().split('T')[0]},${booking.amount},${booking.status},${booking.paymentStatus},${booking.createdAt.toISOString()}`
      ).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="bookings-report-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      res.json({
        status: 'success',
        data: {
          bookings,
          count: bookings.length,
          period: { startDate: start, endDate: end },
          totalRevenue: bookings.reduce((sum, booking) => sum + booking.amount, 0)
        }
      });
    }
  } catch (error) {
    console.error('Generate booking report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate booking report'
    });
  }
});

// @route   GET /api/admin/reports/revenue
// @desc    Generate revenue report
// @access  Private (Admin)
router.get('/reports/revenue', authenticateToken, authorize('admin'), [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Group by must be day, week, or month'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
        break;
      case 'week':
        groupFormat = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
        break;
      case 'month':
        groupFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        break;
    }

    const revenueData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$amount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);

    res.json({
      status: 'success',
      data: {
        revenueData,
        summary: {
          totalRevenue,
          totalBookings,
          averageRevenuePerBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0
        },
        period: { startDate: start, endDate: end },
        groupBy
      }
    });
  } catch (error) {
    console.error('Generate revenue report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate revenue report'
    });
  }
});

// @route   GET /api/admin/reports/buses
// @desc    Generate bus utilization report
// @access  Private (Admin)
router.get('/reports/buses', authenticateToken, authorize('admin'), [
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
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const busUtilization = await Booking.aggregate([
      {
        $match: {
          travelDate: { $gte: start, $lte: end },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: '$busId',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'buses',
          localField: '_id',
          foreignField: '_id',
          as: 'bus'
        }
      },
      {
        $unwind: '$bus'
      },
      {
        $project: {
          busNumber: '$bus.busNumber',
          busName: '$bus.name',
          capacity: '$bus.capacity',
          totalBookings: 1,
          totalRevenue: 1,
          utilizationRate: {
            $multiply: [
              { $divide: ['$totalBookings', '$bus.capacity'] },
              100
            ]
          }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        busUtilization,
        count: busUtilization.length,
        period: { startDate: start, endDate: end }
      }
    });
  } catch (error) {
    console.error('Generate bus utilization report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate bus utilization report'
    });
  }
});

// @route   POST /api/admin/announcements
// @desc    Create system announcement
// @access  Private (Admin)
router.post('/announcements', authenticateToken, authorize('admin'), [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message is required and must be less than 500 characters'),
  body('targetRoles')
    .optional()
    .isArray()
    .withMessage('Target roles must be an array'),
  body('targetRoles.*')
    .optional()
    .isIn(['student', 'staff', 'admin', 'driver'])
    .withMessage('Invalid target role'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { title, message, targetRoles, priority = 'medium' } = req.body;

    let notifications = [];

    if (targetRoles && targetRoles.length > 0) {
      // Send to specific roles
      for (const role of targetRoles) {
        const roleNotifications = await Notification.sendToUsersByRole(role, {
          type: 'system',
          title,
          message,
          priority
        });
        notifications.push(...roleNotifications);
      }
    } else {
      // Send to all users
      const User = require('../models/User');
      const users = await User.find({ status: 'active' }).select('_id');
      const userIds = users.map(user => user._id);
      
      notifications = await Notification.sendToMultipleUsers(userIds, {
        type: 'system',
        title,
        message,
        priority
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Announcement sent successfully',
      data: {
        notifications,
        count: notifications.length,
        targetRoles: targetRoles || 'all'
      }
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create announcement'
    });
  }
});

// @route   GET /api/admin/system-health
// @desc    Get system health status
// @access  Private (Admin)
router.get('/system-health', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Database connection status
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    // Uptime
    const uptime = process.uptime();
    
    // Active connections
    const activeConnections = mongoose.connection.db ? await mongoose.connection.db.admin().serverStatus() : null;
    
    res.json({
      status: 'success',
      data: {
        database: {
          status: dbStatus,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        },
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
        },
        uptime: {
          seconds: Math.round(uptime),
          formatted: formatUptime(uptime)
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch system health'
    });
  }
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

module.exports = router;
