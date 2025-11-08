const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const Driver = require('../models/Driver');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId, validatePagination } = require('../middleware/validation');

// @route   GET /api/drivers
// @desc    Get all drivers
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
        { email: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const drivers = await Driver.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Driver.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        drivers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalDrivers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch drivers'
    });
  }
});

// @route   GET /api/drivers/:id
// @desc    Get driver by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        status: 'error',
        message: 'Driver not found'
      });
    }

    res.json({
      status: 'success',
      data: { driver }
    });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch driver'
    });
  }
});

// @route   POST /api/drivers
// @desc    Create new driver
// @access  Private (Admin)
router.post('/', authenticateToken, authorize('admin'), [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('licenseNumber')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('License number is required and must be less than 20 characters'),
  body('licenseType')
    .isIn(['A', 'B', 'C', 'D', 'E'])
    .withMessage('Invalid license type'),
  body('licenseExpiry')
    .isISO8601()
    .withMessage('License expiry date must be a valid date'),
  body('experience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'on_leave'])
    .withMessage('Invalid status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { name, email, phone, licenseNumber, licenseType, licenseExpiry, experience, status, address, emergencyContact } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ 
      $or: [
        { email },
        { licenseNumber }
      ]
    });
    
    if (existingDriver) {
      return res.status(400).json({
        status: 'error',
        message: 'Driver with this email or license number already exists'
      });
    }

    const driver = await Driver.create({
      name,
      email,
      phone,
      licenseNumber,
      licenseType,
      licenseExpiry,
      experience,
      status: status || 'active',
      address,
      emergencyContact
    });

    res.status(201).json({
      status: 'success',
      message: 'Driver created successfully',
      data: { driver }
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create driver'
    });
  }
});

// @route   PUT /api/drivers/:id
// @desc    Update driver
// @access  Private (Admin)
router.put('/:id', authenticateToken, authorize('admin'), validateObjectId('id'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('License number must be less than 20 characters'),
  body('licenseType')
    .optional()
    .isIn(['A', 'B', 'C', 'D', 'E'])
    .withMessage('Invalid license type'),
  body('licenseExpiry')
    .optional()
    .isISO8601()
    .withMessage('License expiry date must be a valid date'),
  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'on_leave'])
    .withMessage('Invalid status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        status: 'error',
        message: 'Driver not found'
      });
    }

    // Check for duplicate email or license number (if being updated)
    if (req.body.email || req.body.licenseNumber) {
      const existingDriver = await Driver.findOne({
        _id: { $ne: req.params.id },
        $or: [
          req.body.email ? { email: req.body.email } : {},
          req.body.licenseNumber ? { licenseNumber: req.body.licenseNumber } : {}
        ]
      });
      
      if (existingDriver) {
        return res.status(400).json({
          status: 'error',
          message: 'Driver with this email or license number already exists'
        });
      }
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'Driver updated successfully',
      data: { driver: updatedDriver }
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update driver'
    });
  }
});

// @route   DELETE /api/drivers/:id
// @desc    Delete driver
// @access  Private (Admin)
router.delete('/:id', authenticateToken, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        status: 'error',
        message: 'Driver not found'
      });
    }

    // Check if driver is assigned to any buses
    const Bus = require('../models/Bus');
    const assignedBuses = await Bus.countDocuments({ driverId: req.params.id, status: 'active' });

    if (assignedBuses > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete driver assigned to active buses'
      });
    }

    await Driver.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete driver'
    });
  }
});

// @route   PUT /api/drivers/:id/location
// @desc    Update driver location
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
    
    // Check if driver is updating their own location
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update your own location'
      });
    }
    
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        status: 'error',
        message: 'Driver not found'
      });
    }

    await driver.updateLocation(lat, lng);

    res.json({
      status: 'success',
      message: 'Driver location updated successfully'
    });
  } catch (error) {
    console.error('Update driver location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update driver location'
    });
  }
});

// @route   GET /api/drivers/available
// @desc    Get available drivers
// @access  Private
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const drivers = await Driver.findAvailableDrivers();

    res.json({
      status: 'success',
      data: {
        drivers,
        count: drivers.length
      }
    });
  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available drivers'
    });
  }
});

module.exports = router;
