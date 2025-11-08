const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Bus name is required'],
    trim: true,
    maxlength: [100, 'Bus name cannot exceed 100 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Bus capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot exceed 100']
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver assignment is required']
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route assignment is required']
  },
  features: [{
    type: String,
    enum: ['wifi', 'ac', 'charging', 'wheelchair_accessible', 'gps_tracking']
  }],
  specifications: {
    make: String,
    model: String,
    year: Number,
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'electric', 'hybrid']
    },
    color: String
  },
  maintenance: {
    lastServiceDate: Date,
    nextServiceDate: Date,
    mileage: Number,
    serviceHistory: [{
      date: Date,
      type: String,
      description: String,
      cost: Number
    }]
  },
  location: {
    currentLat: Number,
    currentLng: Number,
    lastUpdated: Date,
    isOnline: { type: Boolean, default: false }
  },
  images: [String], // URLs to bus images
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available seats (calculated from bookings)
busSchema.virtual('availableSeats', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'busId',
  count: true,
  match: { 
    status: 'confirmed',
    travelDate: { $gte: new Date() }
  }
});

// Virtual for total bookings today
busSchema.virtual('todayBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'busId',
  count: true,
  match: { 
    status: 'confirmed',
    travelDate: {
      $gte: new Date().setHours(0, 0, 0, 0),
      $lt: new Date().setHours(23, 59, 59, 999)
    }
  }
});

// Index for better query performance
busSchema.index({ busNumber: 1 });
busSchema.index({ status: 1 });
busSchema.index({ driverId: 1 });
busSchema.index({ routeId: 1 });
busSchema.index({ 'location.currentLat': 1, 'location.currentLng': 1 });

// Pre-save middleware
busSchema.pre('save', function(next) {
  // Update location timestamp when location changes
  if (this.isModified('location.currentLat') || this.isModified('location.currentLng')) {
    this.location.lastUpdated = new Date();
  }
  next();
});

// Instance method to check if bus is available
busSchema.methods.isAvailable = function() {
  return this.status === 'active' && this.driverId;
};

// Instance method to update location
busSchema.methods.updateLocation = function(lat, lng) {
  this.location.currentLat = lat;
  this.location.currentLng = lng;
  this.location.lastUpdated = new Date();
  this.location.isOnline = true;
  return this.save();
};

// Static method to find active buses
busSchema.statics.findActiveBuses = function() {
  return this.find({ status: 'active' }).populate('driverId routeId');
};

// Static method to find buses by route
busSchema.statics.findByRoute = function(routeId) {
  return this.find({ routeId, status: 'active' }).populate('driverId');
};

// Static method to find buses near location
busSchema.statics.findNearLocation = function(lat, lng, maxDistance = 5000) {
  return this.find({
    'location.currentLat': {
      $gte: lat - (maxDistance / 111), // Rough conversion: 1 degree ≈ 111 km
      $lte: lat + (maxDistance / 111)
    },
    'location.currentLng': {
      $gte: lng - (maxDistance / 111),
      $lte: lng + (maxDistance / 111)
    },
    status: 'active'
  }).populate('driverId routeId');
};

module.exports = mongoose.model('Bus', busSchema);
