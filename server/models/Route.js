const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    maxlength: [100, 'Route name cannot exceed 100 characters']
  },
  startLocation: {
    type: String,
    required: [true, 'Start location is required'],
    trim: true
  },
  endLocation: {
    type: String,
    required: [true, 'End location is required'],
    trim: true
  },
  waypoints: [{
    name: String,
    lat: Number,
    lng: Number,
    order: Number
  }],
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  estimatedTime: {
    type: Number,
    required: [true, 'Estimated time is required'],
    min: [1, 'Estimated time must be at least 1 minute']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  coordinates: {
    start: {
      lat: Number,
      lng: Number
    },
    end: {
      lat: Number,
      lng: Number
    }
  },
  fare: {
    base: { type: Number, required: true, min: 0 },
    perKm: { type: Number, default: 0 },
    studentDiscount: { type: Number, default: 0.1 }, // 10% discount
    staffDiscount: { type: Number, default: 0.05 }   // 5% discount
  },
  features: [{
    type: String,
    enum: ['wifi', 'ac', 'charging', 'wheelchair_accessible']
  }],
  operatingHours: {
    start: String, // HH:MM format
    end: String,   // HH:MM format
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  capacity: {
    type: Number,
    required: [true, 'Route capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  description: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total buses on this route
routeSchema.virtual('totalBuses', {
  ref: 'Bus',
  localField: '_id',
  foreignField: 'routeId',
  count: true,
  match: { status: 'active' }
});

// Virtual for active schedules
routeSchema.virtual('activeSchedules', {
  ref: 'Schedule',
  localField: '_id',
  foreignField: 'routeId',
  count: true,
  match: { status: 'active' }
});

// Index for better query performance
routeSchema.index({ name: 1 });
routeSchema.index({ status: 1 });
routeSchema.index({ 'coordinates.start.lat': 1, 'coordinates.start.lng': 1 });
routeSchema.index({ 'coordinates.end.lat': 1, 'coordinates.end.lng': 1 });

// Instance method to calculate fare
routeSchema.methods.calculateFare = function(userRole = 'student') {
  let fare = this.fare.base + (this.fare.perKm * this.distance);
  
  if (userRole === 'student') {
    fare = fare * (1 - this.fare.studentDiscount);
  } else if (userRole === 'staff') {
    fare = fare * (1 - this.fare.staffDiscount);
  }
  
  return Math.round(fare * 100) / 100; // Round to 2 decimal places
};

// Instance method to check if route is operational
routeSchema.methods.isOperational = function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  return this.status === 'active' &&
         this.operatingHours.days.includes(currentDay) &&
         currentTime >= this.operatingHours.start &&
         currentTime <= this.operatingHours.end;
};

// Static method to find active routes
routeSchema.statics.findActiveRoutes = function() {
  return this.find({ status: 'active' });
};

// Static method to find routes by location
routeSchema.statics.findByLocation = function(lat, lng, maxDistance = 5000) {
  return this.find({
    $or: [
      {
        'coordinates.start.lat': {
          $gte: lat - (maxDistance / 111),
          $lte: lat + (maxDistance / 111)
        },
        'coordinates.start.lng': {
          $gte: lng - (maxDistance / 111),
          $lte: lng + (maxDistance / 111)
        }
      },
      {
        'coordinates.end.lat': {
          $gte: lat - (maxDistance / 111),
          $lte: lat + (maxDistance / 111)
        },
        'coordinates.end.lng': {
          $gte: lng - (maxDistance / 111),
          $lte: lng + (maxDistance / 111)
        }
      }
    ],
    status: 'active'
  });
};

module.exports = mongoose.model('Route', routeSchema);
