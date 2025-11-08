const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const Bus = require('../models/Bus');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId, validatePagination } = require('../middleware/validation');

// @route   GET /api/buses
// @desc    Get all buses
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, routeId, driverId, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (routeId) filter.routeId = routeId;
    if (driverId) filter.driverId = driverId;
    if (search) {
      filter.$or = [
        { busNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const buses = await Bus.find(filter)
      .populate('driverId', 'name email phone licenseNumber experience performance.rating')
      .populate('routeId', 'name startLocation endLocation distance estimatedTime fare')
      .sort({ busNumber: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Bus.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        buses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBuses: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch buses'
    });
  }
});

// @route   GET /api/buses/:id
// @desc    Get bus by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('driverId', 'name email phone licenseNumber')
      .populate('routeId', 'name startLocation endLocation distance estimatedTime');
    
    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    res.json({
      status: 'success',
      data: { bus }
    });
  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bus'
    });
  }
});

// @route   POST /api/buses
// @desc    Create new bus
// @access  Private (Admin)
router.post('/', authenticateToken, authorize('admin'), [
  body('busNumber')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Bus number is required and must be less than 20 characters'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Bus name is required and must be less than 100 characters'),
  body('capacity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('driverId')
    .isMongoId()
    .withMessage('Valid driver ID is required'),
  body('routeId')
    .isMongoId()
    .withMessage('Valid route ID is required'),
  body('status')
    .optional()
    .isIn(['active', 'maintenance', 'inactive'])
    .withMessage('Invalid status'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('features.*')
    .optional()
    .isIn(['wifi', 'ac', 'charging', 'wheelchair_accessible', 'gps_tracking'])
    .withMessage('Invalid feature'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { busNumber, name, capacity, driverId, routeId, status, features, specifications } = req.body;

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(400).json({
        status: 'error',
        message: 'Bus with this number already exists'
      });
    }

    // Verify driver and route exist
    const Driver = require('../models/Driver');
    const Route = require('../models/Route');
    
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(400).json({
        status: 'error',
        message: 'Driver not found'
      });
    }

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(400).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    const bus = await Bus.create({
      busNumber,
      name,
      capacity,
      driverId,
      routeId,
      status: status || 'active',
      features: features || [],
      specifications: specifications || {}
    });

    const populatedBus = await Bus.findById(bus._id)
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name startLocation endLocation');

    res.status(201).json({
      status: 'success',
      message: 'Bus created successfully',
      data: { bus: populatedBus }
    });
  } catch (error) {
    console.error('Create bus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create bus'
    });
  }
});

// @route   PUT /api/buses/:id
// @desc    Update bus
// @access  Private (Admin)
router.put('/:id', authenticateToken, authorize('admin'), validateObjectId('id'), [
  body('busNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Bus number must be less than 20 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Bus name must be less than 100 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('driverId')
    .optional()
    .isMongoId()
    .withMessage('Valid driver ID is required'),
  body('routeId')
    .optional()
    .isMongoId()
    .withMessage('Valid route ID is required'),
  body('status')
    .optional()
    .isIn(['active', 'maintenance', 'inactive'])
    .withMessage('Invalid status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    // Check if bus number already exists (if being updated)
    if (req.body.busNumber && req.body.busNumber !== bus.busNumber) {
      const existingBus = await Bus.findOne({ busNumber: req.body.busNumber });
      if (existingBus) {
        return res.status(400).json({
          status: 'error',
          message: 'Bus with this number already exists'
        });
      }
    }

    // Verify driver and route exist (if being updated)
    if (req.body.driverId) {
      const Driver = require('../models/Driver');
      const driver = await Driver.findById(req.body.driverId);
      if (!driver) {
        return res.status(400).json({
          status: 'error',
          message: 'Driver not found'
        });
      }
    }

    if (req.body.routeId) {
      const Route = require('../models/Route');
      const route = await Route.findById(req.body.routeId);
      if (!route) {
        return res.status(400).json({
          status: 'error',
          message: 'Route not found'
        });
      }
    }

    const updatedBus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('driverId', 'name email phone')
     .populate('routeId', 'name startLocation endLocation');

    res.json({
      status: 'success',
      message: 'Bus updated successfully',
      data: { bus: updatedBus }
    });
  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update bus'
    });
  }
});

// @route   DELETE /api/buses/:id
// @desc    Delete bus
// @access  Private (Admin)
router.delete('/:id', authenticateToken, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    // Check if bus has active bookings
    const Booking = require('../models/Booking');
    const activeBookings = await Booking.countDocuments({
      busId: req.params.id,
      status: 'confirmed',
      travelDate: { $gte: new Date() }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete bus with active bookings'
      });
    }

    await Bus.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete bus'
    });
  }
});

// @route   PUT /api/buses/:id/location
// @desc    Update bus location
// @access  Private (Driver)
router.put('/:id/location', authenticateToken, authorize('driver'), validateObjectId('id'), [
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    // Check if the driver is assigned to this bus
    if (bus.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not assigned to this bus'
      });
    }

    await bus.updateLocation(lat, lng);

    res.json({
      status: 'success',
      message: 'Bus location updated successfully'
    });
  } catch (error) {
    console.error('Update bus location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update bus location'
    });
  }
});

// @route   GET /api/buses/:id/available-seats
// @desc    Get available seats for a bus on a specific date
// @access  Private
router.get('/:id/available-seats', authenticateToken, validateObjectId('id'), [
  query('travelDate')
    .isISO8601()
    .withMessage('Valid travel date is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { travelDate } = req.query;
    
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    const Booking = require('../models/Booking');
    const availableSeats = await Booking.findAvailableSeats(req.params.id, travelDate);

    res.json({
      status: 'success',
      data: {
        busId: req.params.id,
        travelDate,
        totalCapacity: bus.capacity,
        availableSeats,
        availableCount: availableSeats.length
      }
    });
  } catch (error) {
    console.error('Get available seats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available seats'
    });
  }
});

// @route   GET /api/buses/near-location
// @desc    Find buses near a location
// @access  Private
router.get('/near-location', authenticateToken, [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  query('maxDistance')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Max distance must be between 100 and 50000 meters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;
    
    const buses = await Bus.findNearLocation(parseFloat(lat), parseFloat(lng), parseInt(maxDistance));

    res.json({
      status: 'success',
      data: {
        buses,
        count: buses.length,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        maxDistance: parseInt(maxDistance)
      }
    });
  } catch (error) {
    console.error('Find buses near location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to find buses near location'
    });
  }
});

module.exports = router;
