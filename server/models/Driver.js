const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  licenseType: {
    type: String,
    required: [true, 'License type is required'],
    enum: ['A', 'B', 'C', 'D', 'E'], // Different license types
    default: 'D'
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'License expiry date is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on_leave'],
    default: 'active'
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  documents: {
    licenseImage: String,
    idProof: String,
    addressProof: String,
    medicalCertificate: String,
    backgroundCheck: String
  },
  performance: {
    rating: { type: Number, default: 5, min: 1, max: 5 },
    totalTrips: { type: Number, default: 0 },
    onTimeTrips: { type: Number, default: 0 },
    complaints: { type: Number, default: 0 },
    lastPerformanceReview: Date
  },
  schedule: {
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    shiftStart: String, // HH:MM format
    shiftEnd: String,   // HH:MM format
    maxHoursPerDay: { type: Number, default: 8 },
    maxHoursPerWeek: { type: Number, default: 48 }
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date,
    isOnline: { type: Boolean, default: false }
  },
  notes: String,
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for on-time percentage
driverSchema.virtual('onTimePercentage').get(function() {
  if (this.performance.totalTrips === 0) return 100;
  return Math.round((this.performance.onTimeTrips / this.performance.totalTrips) * 100);
});

// Virtual for license status
driverSchema.virtual('licenseStatus').get(function() {
  const today = new Date();
  const expiryDate = new Date(this.licenseExpiry);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'valid';
});

// Index for better query performance
driverSchema.index({ email: 1 });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });

// Pre-save middleware
driverSchema.pre('save', function(next) {
  // Update location timestamp when location changes
  if (this.isModified('currentLocation.lat') || this.isModified('currentLocation.lng')) {
    this.currentLocation.lastUpdated = new Date();
  }
  next();
});

// Instance method to check if driver is available
driverSchema.methods.isAvailable = function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  return this.status === 'active' &&
         this.licenseStatus === 'valid' &&
         this.schedule.workingDays.includes(currentDay) &&
         currentTime >= this.schedule.shiftStart &&
         currentTime <= this.schedule.shiftEnd;
};

// Instance method to update location
driverSchema.methods.updateLocation = function(lat, lng) {
  this.currentLocation.lat = lat;
  this.currentLocation.lng = lng;
  this.currentLocation.lastUpdated = new Date();
  this.currentLocation.isOnline = true;
  return this.save();
};

// Instance method to update performance
driverSchema.methods.updatePerformance = function(tripCompleted, onTime = true) {
  this.performance.totalTrips += 1;
  if (onTime) {
    this.performance.onTimeTrips += 1;
  }
  return this.save();
};

// Static method to find active drivers
driverSchema.statics.findActiveDrivers = function() {
  return this.find({ status: 'active' });
};

// Static method to find available drivers
driverSchema.statics.findAvailableDrivers = function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  return this.find({
    status: 'active',
    'schedule.workingDays': currentDay,
    'schedule.shiftStart': { $lte: currentTime },
    'schedule.shiftEnd': { $gte: currentTime },
    licenseExpiry: { $gt: new Date() }
  });
};

// Static method to find drivers near location
driverSchema.statics.findNearLocation = function(lat, lng, maxDistance = 10000) {
  return this.find({
    'currentLocation.lat': {
      $gte: lat - (maxDistance / 111),
      $lte: lat + (maxDistance / 111)
    },
    'currentLocation.lng': {
      $gte: lng - (maxDistance / 111),
      $lte: lng + (maxDistance / 111)
    },
    status: 'active'
  });
};

module.exports = mongoose.model('Driver', driverSchema);
