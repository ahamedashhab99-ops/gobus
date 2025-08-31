import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus is required']
  },
  seatsBooked: [{
    type: Number,
    required: true,
    min: [1, 'Seat number must be at least 1']
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [1, 'Total amount must be at least 1']
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Index for user bookings
bookingSchema.index({ userId: 1, createdAt: -1 });

// Index for bus bookings
bookingSchema.index({ busId: 1 });

export default mongoose.model('Booking', bookingSchema);