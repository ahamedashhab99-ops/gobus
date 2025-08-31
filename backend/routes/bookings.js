import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Bus from '../models/Bus.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create new booking
router.post('/create', authenticate, [
  body('busId').isMongoId().withMessage('Invalid bus ID'),
  body('seatsBooked').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
  body('seatsBooked.*').isInt({ min: 1 }).withMessage('Invalid seat number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { busId, seatsBooked } = req.body;
    const userId = req.user._id;

    // Find the bus
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Check if bus date is in the future
    if (new Date(bus.date) < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Cannot book seats for past dates' });
    }

    // Check seat availability
    if (bus.availableSeats < seatsBooked.length) {
      return res.status(400).json({ 
        message: `Only ${bus.availableSeats} seats available` 
      });
    }

    // Validate seat numbers
    const invalidSeats = seatsBooked.filter(seat => seat > bus.totalSeats);
    if (invalidSeats.length > 0) {
      return res.status(400).json({ 
        message: `Invalid seat numbers: ${invalidSeats.join(', ')}` 
      });
    }

    // Check if seats are already booked
    const existingBookings = await Booking.find({
      busId: busId,
      status: 'confirmed',
      seatsBooked: { $in: seatsBooked }
    });

    if (existingBookings.length > 0) {
      const bookedSeats = existingBookings.flatMap(booking => booking.seatsBooked);
      const conflictSeats = seatsBooked.filter(seat => bookedSeats.includes(seat));
      return res.status(400).json({ 
        message: `Seats already booked: ${conflictSeats.join(', ')}` 
      });
    }

    // Calculate total amount
    const totalAmount = seatsBooked.length * bus.price;

    // Create booking
    const booking = new Booking({
      userId,
      busId,
      seatsBooked,
      totalAmount
    });

    await booking.save();

    // Update bus available seats
    bus.availableSeats -= seatsBooked.length;
    await bus.save();

    // Populate booking with user and bus details
    await booking.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'busId', select: 'busNumber from to date time price' }
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('busId', 'busNumber from to date time price')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Bookings retrieved successfully',
      bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error retrieving bookings' });
  }
});

// Get all bookings (Admin only)
router.get('/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('busId', 'busNumber from to date time price')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalBookings: bookings.length,
      totalRevenue: bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => sum + booking.totalAmount, 0),
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length
    };

    res.json({
      message: 'All bookings retrieved successfully',
      bookings,
      stats
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error retrieving bookings' });
  }
});

// Cancel booking
router.patch('/cancel/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('busId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Check if bus date is in the future (allow cancellation up to 2 hours before departure)
    const busDateTime = new Date(`${booking.busId.date.toISOString().split('T')[0]}T${booking.busId.time}`);
    const twoHoursBefore = new Date(busDateTime.getTime() - 2 * 60 * 60 * 1000);
    
    if (new Date() > twoHoursBefore) {
      return res.status(400).json({ 
        message: 'Cannot cancel booking less than 2 hours before departure' 
      });
    }

    // Cancel booking
    booking.status = 'cancelled';
    await booking.save();

    // Update bus available seats
    const bus = await Bus.findById(booking.busId._id);
    bus.availableSeats += booking.seatsBooked.length;
    await bus.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
});

export default router;