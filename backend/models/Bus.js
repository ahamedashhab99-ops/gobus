import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    trim: true,
    uppercase: true,
    unique: true
  },
  from: {
    type: String,
    required: [true, 'Source city is required'],
    trim: true
  },
  to: {
    type: String,
    required: [true, 'Destination city is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Travel date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Travel date cannot be in the past'
    }
  },
  time: {
    type: String,
    required: [true, 'Departure time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Total seats must be at least 1'],
    max: [60, 'Total seats cannot exceed 60']
  },
  availableSeats: {
    type: Number,
    required: true,
    min: [0, 'Available seats cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least 1']
  }
}, {
  timestamps: true
});

// Compound index for search queries
busSchema.index({ from: 1, to: 1, date: 1 });

// Set available seats to total seats before saving new bus
busSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

export default mongoose.model('Bus', busSchema);