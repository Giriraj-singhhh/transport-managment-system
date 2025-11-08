const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus ID is required']
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Schedule ID is required']
  },
  seatNumber: {
    type: Number,
    required: [true, 'Seat number is required'],
    min: [1, 'Seat number must be at least 1']
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  travelDate: {
    type: Date,
    required: [true, 'Travel date is required']
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    default: 'cash'
  },
  paymentDetails: {
    transactionId: String,
    paymentGateway: String,
    paidAt: Date
  },
  passengerDetails: {
    name: String,
    phone: String,
    email: String,
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    }
  },
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  },
  boardingPoint: {
    name: String,
    lat: Number,
    lng: Number,
    time: String
  },
  dropPoint: {
    name: String,
    lat: Number,
    lng: Number,
    time: String
  },
  specialRequests: [String],
  notes: String,
  qrCode: String, // For ticket verification
  ticketNumber: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for booking reference
bookingSchema.virtual('bookingReference').get(function() {
  return `CT${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for is active booking
bookingSchema.virtual('isActive').get(function() {
  return this.status === 'confirmed' && this.travelDate >= new Date();
});

// Virtual for can be cancelled
bookingSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const travelDate = new Date(this.travelDate);
  const hoursUntilTravel = (travelDate - now) / (1000 * 60 * 60);
  
  return this.status === 'confirmed' && hoursUntilTravel > 2; // Can cancel up to 2 hours before travel
});

// Index for better query performance
bookingSchema.index({ userId: 1 });
bookingSchema.index({ busId: 1 });
bookingSchema.index({ scheduleId: 1 });
bookingSchema.index({ travelDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ ticketNumber: 1 });
bookingSchema.index({ 'passengerDetails.email': 1 });
bookingSchema.index({ 'passengerDetails.phone': 1 });

// Compound indexes
bookingSchema.index({ busId: 1, travelDate: 1, seatNumber: 1 });
bookingSchema.index({ userId: 1, travelDate: 1 });

// Pre-save middleware
bookingSchema.pre('save', async function(next) {
  // Generate ticket number if not exists
  if (!this.ticketNumber && this.status === 'confirmed') {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TKT${String(count + 1).padStart(6, '0')}`;
  }
  
  // Validate travel date
  if (this.travelDate < new Date()) {
    return next(new Error('Travel date cannot be in the past'));
  }
  
  next();
});

// Instance method to cancel booking
bookingSchema.methods.cancelBooking = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancellation.cancelledAt = new Date();
  this.cancellation.cancelledBy = cancelledBy;
  this.cancellation.reason = reason;
  
  // Calculate refund amount (80% refund if cancelled more than 24 hours before travel)
  const now = new Date();
  const travelDate = new Date(this.travelDate);
  const hoursUntilTravel = (travelDate - now) / (1000 * 60 * 60);
  
  if (hoursUntilTravel > 24) {
    this.cancellation.refundAmount = this.amount * 0.8;
  } else if (hoursUntilTravel > 2) {
    this.cancellation.refundAmount = this.amount * 0.5;
  } else {
    this.cancellation.refundAmount = 0;
  }
  
  return this.save();
};

// Instance method to mark as completed
bookingSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Instance method to mark as no-show
bookingSchema.methods.markNoShow = function() {
  this.status = 'no_show';
  return this.save();
};

// Static method to find user bookings
bookingSchema.statics.findUserBookings = function(userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('busId routeId scheduleId')
    .sort({ travelDate: -1 });
};

// Static method to find bookings for a specific bus and date
bookingSchema.statics.findBusBookings = function(busId, travelDate) {
  return this.find({
    busId,
    travelDate: {
      $gte: new Date(travelDate).setHours(0, 0, 0, 0),
      $lt: new Date(travelDate).setHours(23, 59, 59, 999)
    },
    status: 'confirmed'
  }).populate('userId');
};

// Static method to find available seats for a bus on a specific date
bookingSchema.statics.findAvailableSeats = async function(busId, travelDate) {
  const bus = await mongoose.model('Bus').findById(busId);
  if (!bus) throw new Error('Bus not found');
  
  const bookedSeats = await this.find({
    busId,
    travelDate: {
      $gte: new Date(travelDate).setHours(0, 0, 0, 0),
      $lt: new Date(travelDate).setHours(23, 59, 59, 999)
    },
    status: 'confirmed'
  }).select('seatNumber');
  
  const bookedSeatNumbers = bookedSeats.map(booking => booking.seatNumber);
  const availableSeats = [];
  
  for (let i = 1; i <= bus.capacity; i++) {
    if (!bookedSeatNumbers.includes(i)) {
      availableSeats.push(i);
    }
  }
  
  return availableSeats;
};

// Static method to get booking statistics
bookingSchema.statics.getBookingStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        travelDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Booking', bookingSchema);
