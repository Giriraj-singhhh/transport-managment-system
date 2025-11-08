const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const Booking = require('../models/Booking');
const { authenticateToken, authorize, authorizeResource } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId, validatePagination } = require('../middleware/validation');

// @route   GET /api/bookings
// @desc    Get all bookings (Admin sees all, users see their own)
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, paymentStatus, busId, userId, travelDate } = req.query;
    
    const filter = {};
    // Non-admin users can only see their own bookings
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    } else if (userId) {
      filter.userId = userId;
    }
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (busId) filter.busId = busId;
    if (travelDate) {
      const date = new Date(travelDate);
      filter.travelDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'firstName lastName email phone role')
      .populate({
        path: 'busId',
        select: 'busNumber name capacity',
        populate: {
          path: 'driverId',
          select: 'name email phone licenseNumber experience performance.rating'
        }
      })
      .populate({
        path: 'scheduleId',
        select: 'departureTime arrivalTime dayOfWeek fare status capacity',
        populate: [
          {
            path: 'routeId',
            select: 'name startLocation endLocation distance estimatedTime fare features'
          },
          {
            path: 'busId',
            select: 'busNumber name capacity'
          }
        ]
      })
      .sort({ travelDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone role')
      .populate('busId', 'busNumber name capacity')
      .populate('scheduleId', 'departureTime arrivalTime dayOfWeek')
      .populate('routeId', 'name startLocation endLocation');
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user can access this booking
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking'
    });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', authenticateToken, [
  body('busId')
    .isMongoId()
    .withMessage('Valid bus ID is required'),
  body('scheduleId')
    .isMongoId()
    .withMessage('Valid schedule ID is required'),
  body('seatNumber')
    .isInt({ min: 1 })
    .withMessage('Seat number must be a positive integer'),
  body('travelDate')
    .isISO8601()
    .withMessage('Travel date must be a valid date'),
  body('passengerDetails.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Passenger name is required and must be less than 100 characters'),
  body('passengerDetails.phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('passengerDetails.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('passengerDetails.age')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Age must be between 1 and 120'),
  body('passengerDetails.gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'upi', 'wallet'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { busId, scheduleId, seatNumber, travelDate, passengerDetails, paymentMethod, boardingPoint, dropPoint, specialRequests } = req.body;

    // Verify bus and schedule exist
    const Bus = require('../models/Bus');
    const Schedule = require('../models/Schedule');
    
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(400).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(400).json({
        status: 'error',
        message: 'Schedule not found'
      });
    }

    // Check if bus and schedule match
    if (schedule.busId.toString() !== busId) {
      return res.status(400).json({
        status: 'error',
        message: 'Schedule does not match the selected bus'
      });
    }

    // Check if seat is available
    const availableSeats = await Booking.findAvailableSeats(busId, travelDate);
    if (!availableSeats.includes(seatNumber)) {
      return res.status(400).json({
        status: 'error',
        message: 'Seat is not available'
      });
    }

    // Check if user already has a booking for this bus and date
    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      busId,
      travelDate: {
        $gte: new Date(travelDate).setHours(0, 0, 0, 0),
        $lt: new Date(travelDate).setHours(23, 59, 59, 999)
      },
      status: 'confirmed'
    });

    if (existingBooking) {
      return res.status(400).json({
        status: 'error',
        message: 'You already have a booking for this bus on this date'
      });
    }

    // Calculate fare
    const Route = require('../models/Route');
    const route = await Route.findById(schedule.routeId);
    const amount = route ? route.calculateFare(req.user.role) : schedule.fare;

    const booking = await Booking.create({
      userId: req.user._id,
      busId,
      scheduleId,
      seatNumber,
      travelDate: new Date(travelDate),
      amount,
      paymentMethod: paymentMethod || 'cash',
      passengerDetails,
      boardingPoint,
      dropPoint,
      specialRequests: specialRequests || []
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('busId', 'busNumber name')
      .populate('scheduleId', 'departureTime arrivalTime')
      .populate('routeId', 'name startLocation endLocation');

    // Create notification
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: req.user._id,
      type: 'booking',
      title: 'Booking Confirmed',
      message: `Your booking for ${bus.busNumber} on ${new Date(travelDate).toLocaleDateString()} has been confirmed.`,
      data: { bookingId: booking._id }
    });

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking'
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', authenticateToken, validateObjectId('id'), [
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Reason must be less than 200 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking cannot be cancelled (less than 2 hours before travel)'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        status: 'error',
        message: 'Only confirmed bookings can be cancelled'
      });
    }

    await booking.cancelBooking(req.user._id, reason);

    // Create notification
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: booking.userId,
      type: 'cancellation',
      title: 'Booking Cancelled',
      message: `Your booking has been cancelled. Refund amount: ₹${booking.cancellation.refundAmount}`,
      data: { bookingId: booking._id, refundAmount: booking.cancellation.refundAmount }
    });

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: { 
        booking,
        refundAmount: booking.cancellation.refundAmount
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel booking'
    });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Mark booking as completed
// @access  Private (Admin/Driver)
router.put('/:id/complete', authenticateToken, authorize('admin', 'driver'), validateObjectId('id'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        status: 'error',
        message: 'Only confirmed bookings can be marked as completed'
      });
    }

    await booking.markCompleted();

    res.json({
      status: 'success',
      message: 'Booking marked as completed'
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark booking as completed'
    });
  }
});

// @route   GET /api/bookings/bus/:busId/date/:date
// @desc    Get bookings for a specific bus and date
// @access  Private
router.get('/bus/:busId/date/:date', authenticateToken, validateObjectId('busId'), [
  param('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { busId, date } = req.params;
    
    const bookings = await Booking.findBusBookings(busId, date);

    res.json({
      status: 'success',
      data: {
        bookings,
        count: bookings.length,
        busId,
        date
      }
    });
  } catch (error) {
    console.error('Get bus bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bus bookings'
    });
  }
});

// @route   GET /api/bookings/stats
// @desc    Get booking statistics (Admin only)
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

    const stats = await Booking.getBookingStats(start, end);

    res.json({
      status: 'success',
      data: {
        stats,
        period: { startDate: start, endDate: end }
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking statistics'
    });
  }
});

module.exports = router;
