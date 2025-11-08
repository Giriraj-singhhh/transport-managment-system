const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus assignment is required']
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route assignment is required']
  },
  departureTime: {
    type: String,
    required: [true, 'Departure time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  arrivalTime: {
    type: String,
    required: [true, 'Arrival time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  dayOfWeek: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  }],
  status: {
    type: String,
    enum: ['active', 'cancelled', 'delayed', 'completed'],
    default: 'active'
  },
  delay: {
    minutes: { type: Number, default: 0 },
    reason: String,
    updatedAt: Date
  },
  capacity: {
    type: Number,
    required: [true, 'Schedule capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: [0, 'Fare cannot be negative']
  },
  notes: String,
  isRecurring: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current bookings count
scheduleSchema.virtual('currentBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'scheduleId',
  count: true,
  match: { 
    status: 'confirmed',
    travelDate: { $gte: new Date() }
  }
});

// Virtual for available seats
scheduleSchema.virtual('availableSeats').get(function() {
  return this.capacity - (this.currentBookings || 0);
});

// Virtual for next departure
scheduleSchema.virtual('nextDeparture').get(function() {
  // Return null if dayOfWeek is not defined or empty
  if (!this.dayOfWeek || !Array.isArray(this.dayOfWeek) || this.dayOfWeek.length === 0) {
    return null;
  }
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  if (this.dayOfWeek.includes(currentDay) && this.departureTime > currentTime) {
    return this.departureTime;
  }
  
  // Find next occurrence
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayIndex = days.indexOf(currentDay);
  
  if (currentDayIndex === -1) return null;
  
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = days[nextDayIndex];
    
    if (this.dayOfWeek.includes(nextDay)) {
      return {
        day: nextDay,
        time: this.departureTime
      };
    }
  }
  
  return null;
});

// Index for better query performance
scheduleSchema.index({ busId: 1 });
scheduleSchema.index({ routeId: 1 });
scheduleSchema.index({ dayOfWeek: 1 });
scheduleSchema.index({ departureTime: 1 });
scheduleSchema.index({ status: 1 });
scheduleSchema.index({ validFrom: 1, validUntil: 1 });

// Pre-save middleware
scheduleSchema.pre('save', function(next) {
  // Validate departure and arrival times
  if (this.departureTime >= this.arrivalTime) {
    return next(new Error('Arrival time must be after departure time'));
  }
  
  // Update delay timestamp when delay changes
  if (this.isModified('delay.minutes') || this.isModified('delay.reason')) {
    this.delay.updatedAt = new Date();
  }
  
  next();
});

// Instance method to check if schedule is active today
scheduleSchema.methods.isActiveToday = function() {
  if (!this.dayOfWeek || !Array.isArray(this.dayOfWeek) || this.dayOfWeek.length === 0) {
    return false;
  }
  
  const today = new Date();
  const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  return this.status === 'active' &&
         this.dayOfWeek.includes(currentDay) &&
         (!this.validFrom || today >= this.validFrom) &&
         (!this.validUntil || today <= this.validUntil);
};

// Instance method to get actual departure time (including delays)
scheduleSchema.methods.getActualDepartureTime = function() {
  if (this.delay.minutes > 0) {
    const [hours, minutes] = this.departureTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + this.delay.minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
  return this.departureTime;
};

// Instance method to update delay
scheduleSchema.methods.updateDelay = function(minutes, reason) {
  this.delay.minutes = minutes;
  this.delay.reason = reason;
  this.delay.updatedAt = new Date();
  if (minutes > 0) {
    this.status = 'delayed';
  } else {
    this.status = 'active';
  }
  return this.save();
};

// Static method to find schedules for today
scheduleSchema.statics.findTodaySchedules = function() {
  const today = new Date();
  const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  return this.find({
    dayOfWeek: { $in: [currentDay] },
    status: { $in: ['active', 'delayed'] },
    $and: [
      {
        $or: [
          { validFrom: { $exists: false } },
          { validFrom: { $lte: today } }
        ]
      },
      {
        $or: [
          { validUntil: { $exists: false } },
          { validUntil: { $gte: today } }
        ]
      }
    ]
  })
  .populate({
    path: 'busId',
    populate: {
      path: 'driverId',
      select: 'name email phone'
    }
  })
  .populate('routeId');
};

// Static method to find schedules by route and day
scheduleSchema.statics.findByRouteAndDay = function(routeId, dayOfWeek) {
  return this.find({
    routeId,
    dayOfWeek: { $in: Array.isArray(dayOfWeek) ? dayOfWeek : [dayOfWeek] },
    status: 'active'
  })
  .populate({
    path: 'busId',
    populate: {
      path: 'driverId',
      select: 'name email phone'
    }
  })
  .populate('routeId');
};

// Static method to find upcoming schedules
scheduleSchema.statics.findUpcoming = function(hours = 24) {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  // Find schedules for today that haven't departed yet, or schedules for future days
  return this.find({
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
  .limit(50); // Limit to 50 upcoming schedules
};

module.exports = mongoose.model('Schedule', scheduleSchema);
