const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .isIn(['student', 'staff', 'admin', 'driver'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Department must be less than 100 characters'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Student ID must be less than 20 characters'),
  body('employeeId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Employee ID must be less than 20 characters'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  handleValidationErrors
];

// Bus validation rules
const validateBus = [
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
  handleValidationErrors
];

// Driver validation rules
const validateDriver = [
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
];

// Route validation rules
const validateRoute = [
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
];

// Schedule validation rules
const validateSchedule = [
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
];

// Booking validation rules
const validateBooking = [
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
  handleValidationErrors
];

// Notification validation rules
const validateNotification = [
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
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateBus,
  validateDriver,
  validateRoute,
  validateSchedule,
  validateBooking,
  validateNotification,
  validateObjectId,
  validatePagination
};
