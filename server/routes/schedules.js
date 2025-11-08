const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const Schedule = require('../models/Schedule');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId, validatePagination } = require('../middleware/validation');

// @route   GET /api/schedules
// @desc    Get all schedules
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, busId, routeId, dayOfWeek } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (busId) filter.busId = busId;
    if (routeId) filter.routeId = routeId;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;

    const schedules = await Schedule.find(filter)
      .populate({
        path: 'busId',
        select: 'busNumber name capacity driverId',
        populate: {
          path: 'driverId',
          select: 'name email phone licenseNumber experience performance.rating'
        }
      })
      .populate('routeId', 'name startLocation endLocation distance estimatedTime fare features waypoints coordinates')
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Schedule.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        schedules,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalSchedules: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch schedules'
    });
  }
});

// @route   GET /api/schedules/:id
// @desc    Get schedule by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('busId', 'busNumber name capacity driverId')
      .populate('routeId', 'name startLocation endLocation distance estimatedTime');
    
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Schedule not found'
      });
    }

    res.json({
      status: 'success',
      data: { schedule }
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch schedule'
    });
  }
});

// @route   POST /api/schedules
// @desc    Create new schedule
// @access  Private (Admin)
router.post('/', authenticateToken, authorize('admin'), [
  body('busId')
    .isMongoId()
    .withMessage('Valid bus ID is required'),
  body('routeId')
    .isMongoId()
    .withMessage('Valid route ID is required'),
  body('departureTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Departure time must be in HH:MM format'),
  body('arrivalTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Arrival time must be in HH:MM format'),
  body('dayOfWeek')
    .isArray({ min: 1 })
    .withMessage('At least one day of week is required'),
  body('dayOfWeek.*')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('fare')
    .isFloat({ min: 0 })
    .withMessage('Fare must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'cancelled', 'delayed', 'completed'])
    .withMessage('Invalid status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { busId, routeId, departureTime, arrivalTime, dayOfWeek, capacity, fare, status, notes, isRecurring, validFrom, validUntil } = req.body;

    // Verify bus and route exist
    const Bus = require('../models/Bus');
    const Route = require('../models/Route');
    
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(400).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(400).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    // Validate departure and arrival times
    if (departureTime >= arrivalTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Arrival time must be after departure time'
      });
    }

    const schedule = await Schedule.create({
      busId,
      routeId,
      departureTime,
      arrivalTime,
      dayOfWeek,
      capacity,
      fare,
      status: status || 'active',
      notes,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null
    });

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('busId', 'busNumber name capacity')
      .populate('routeId', 'name startLocation endLocation');

    res.status(201).json({
      status: 'success',
      message: 'Schedule created successfully',
      data: { schedule: populatedSchedule }
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create schedule'
    });
  }
});

// @route   PUT /api/schedules/:id
// @desc    Update schedule
// @access  Private (Admin)
router.put('/:id', authenticateToken, authorize('admin'), validateObjectId('id'), [
  body('departureTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Departure time must be in HH:MM format'),
  body('arrivalTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Arrival time must be in HH:MM format'),
  body('dayOfWeek')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one day of week is required'),
  body('dayOfWeek.*')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('fare')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fare must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'cancelled', 'delayed', 'completed'])
    .withMessage('Invalid status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Schedule not found'
      });
    }

    // Validate departure and arrival times if both are being updated
    if (req.body.departureTime && req.body.arrivalTime) {
      if (req.body.departureTime >= req.body.arrivalTime) {
        return res.status(400).json({
          status: 'error',
          message: 'Arrival time must be after departure time'
        });
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('busId', 'busNumber name capacity')
     .populate('routeId', 'name startLocation endLocation');

    res.json({
      status: 'success',
      message: 'Schedule updated successfully',
      data: { schedule: updatedSchedule }
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update schedule'
    });
  }
});

// @route   DELETE /api/schedules/:id
// @desc    Delete schedule
// @access  Private (Admin)
router.delete('/:id', authenticateToken, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Schedule not found'
      });
    }

    // Check if schedule has active bookings
    const Booking = require('../models/Booking');
    const activeBookings = await Booking.countDocuments({
      scheduleId: req.params.id,
      status: 'confirmed',
      travelDate: { $gte: new Date() }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete schedule with active bookings'
      });
    }

    await Schedule.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete schedule'
    });
  }
});

// @route   PUT /api/schedules/:id/delay
// @desc    Update schedule delay
// @access  Private (Admin/Driver)
router.put('/:id/delay', authenticateToken, validateObjectId('id'), [
  body('minutes')
    .isInt({ min: 0 })
    .withMessage('Delay minutes must be a non-negative integer'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Reason must be less than 200 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { minutes, reason } = req.body;
    
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Schedule not found'
      });
    }

    // Check if user can update delay (admin or assigned driver)
    if (req.user.role === 'driver') {
      const Bus = require('../models/Bus');
      const bus = await Bus.findById(schedule.busId);
      if (!bus || bus.driverId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to update this schedule'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    await schedule.updateDelay(minutes, reason);

    const updatedSchedule = await Schedule.findById(req.params.id)
      .populate('busId', 'busNumber name')
      .populate('routeId', 'name startLocation endLocation');

    res.json({
      status: 'success',
      message: 'Schedule delay updated successfully',
      data: { schedule: updatedSchedule }
    });
  } catch (error) {
    console.error('Update schedule delay error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update schedule delay'
    });
  }
});

// @route   GET /api/schedules/today
// @desc    Get today's schedules
// @access  Private
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const schedules = await Schedule.findTodaySchedules();

    res.json({
      status: 'success',
      data: {
        schedules,
        count: schedules.length,
        date: new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Get today schedules error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch today\'s schedules'
    });
  }
});

// @route   GET /api/schedules/upcoming
// @desc    Get upcoming schedules
// @access  Private
router.get('/upcoming', authenticateToken, [
  query('hours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('Hours must be between 1 and 168'),
  handleValidationErrors
], async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    // Use find instead of findUpcoming to avoid virtual issues
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const schedules = await Schedule.find({
      status: { $in: ['active', 'delayed'] },
      $or: [
        {
          dayOfWeek: { $in: [currentDay] },
          departureTime: { $gte: currentTime }
        },
        {
          dayOfWeek: { $nin: [currentDay] }
        }
      ]
    })
    .populate({
      path: 'busId',
      select: 'busNumber name capacity driverId',
      populate: {
        path: 'driverId',
        select: 'name email phone licenseNumber experience performance.rating'
      }
    })
    .populate('routeId', 'name startLocation endLocation distance estimatedTime fare features waypoints coordinates')
    .sort({ departureTime: 1 })
    .limit(50);

    res.json({
      status: 'success',
      data: {
        schedules,
        count: schedules.length,
        hours
      }
    });
  } catch (error) {
    console.error('Get upcoming schedules error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch upcoming schedules'
    });
  }
});

module.exports = router;
