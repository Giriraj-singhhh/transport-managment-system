const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const Route = require('../models/Route');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId, validatePagination } = require('../middleware/validation');

// @route   GET /api/routes
// @desc    Get all routes
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, search } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { startLocation: { $regex: search, $options: 'i' } },
        { endLocation: { $regex: search, $options: 'i' } }
      ];
    }

    const routes = await Route.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Route.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        routes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRoutes: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch routes'
    });
  }
});

// @route   GET /api/routes/:id
// @desc    Get route by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    res.json({
      status: 'success',
      data: { route }
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch route'
    });
  }
});

// @route   POST /api/routes
// @desc    Create new route
// @access  Private (Admin)
router.post('/', authenticateToken, authorize('admin'), [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Route name is required and must be less than 100 characters'),
  body('startLocation')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Start location is required and must be less than 200 characters'),
  body('endLocation')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('End location is required and must be less than 200 characters'),
  body('distance')
    .isFloat({ min: 0 })
    .withMessage('Distance must be a positive number'),
  body('estimatedTime')
    .isInt({ min: 1 })
    .withMessage('Estimated time must be at least 1 minute'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Invalid status'),
  body('fare.base')
    .isFloat({ min: 0 })
    .withMessage('Base fare must be a positive number'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { 
      name, 
      startLocation, 
      endLocation, 
      waypoints, 
      distance, 
      estimatedTime, 
      status, 
      coordinates, 
      fare, 
      features, 
      operatingHours, 
      capacity, 
      description 
    } = req.body;

    const route = await Route.create({
      name,
      startLocation,
      endLocation,
      waypoints: waypoints || [],
      distance,
      estimatedTime,
      status: status || 'active',
      coordinates: coordinates || {},
      fare: fare || { base: 0, perKm: 0, studentDiscount: 0.1, staffDiscount: 0.05 },
      features: features || [],
      operatingHours: operatingHours || { start: '06:00', end: '22:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
      capacity,
      description
    });

    res.status(201).json({
      status: 'success',
      message: 'Route created successfully',
      data: { route }
    });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create route'
    });
  }
});

// @route   PUT /api/routes/:id
// @desc    Update route
// @access  Private (Admin)
router.put('/:id', authenticateToken, authorize('admin'), validateObjectId('id'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Route name must be less than 100 characters'),
  body('startLocation')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Start location must be less than 200 characters'),
  body('endLocation')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('End location must be less than 200 characters'),
  body('distance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distance must be a positive number'),
  body('estimatedTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated time must be at least 1 minute'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Invalid status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'Route updated successfully',
      data: { route: updatedRoute }
    });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update route'
    });
  }
});

// @route   DELETE /api/routes/:id
// @desc    Delete route
// @access  Private (Admin)
router.delete('/:id', authenticateToken, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    // Check if route has active buses
    const Bus = require('../models/Bus');
    const activeBuses = await Bus.countDocuments({ routeId: req.params.id, status: 'active' });

    if (activeBuses > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete route with active buses'
      });
    }

    await Route.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete route'
    });
  }
});

// @route   GET /api/routes/:id/fare
// @desc    Calculate fare for a route
// @access  Private
router.get('/:id/fare', authenticateToken, validateObjectId('id'), [
  query('userRole')
    .optional()
    .isIn(['student', 'staff', 'admin', 'driver'])
    .withMessage('Invalid user role'),
  handleValidationErrors
], async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    const userRole = req.query.userRole || req.user.role;
    const fare = route.calculateFare(userRole);

    res.json({
      status: 'success',
      data: {
        routeId: req.params.id,
        userRole,
        fare,
        baseFare: route.fare.base,
        distance: route.distance,
        discount: userRole === 'student' ? route.fare.studentDiscount : 
                 userRole === 'staff' ? route.fare.staffDiscount : 0
      }
    });
  } catch (error) {
    console.error('Calculate fare error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to calculate fare'
    });
  }
});

// @route   GET /api/routes/near-location
// @desc    Find routes near a location
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
    
    const routes = await Route.findByLocation(parseFloat(lat), parseFloat(lng), parseInt(maxDistance));

    res.json({
      status: 'success',
      data: {
        routes,
        count: routes.length,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        maxDistance: parseInt(maxDistance)
      }
    });
  } catch (error) {
    console.error('Find routes near location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to find routes near location'
    });
  }
});

module.exports = router;
