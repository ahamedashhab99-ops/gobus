import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Bus from '../models/Bus.js';
import Booking from '../models/Booking.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Initialize sample buses
const initializeSampleBuses = async () => {
  try {
    const busCount = await Bus.countDocuments();
    if (busCount === 0) {
      const sampleBuses = [
        {
          busNumber: 'MH12AB1234',
          from: 'Mumbai',
          to: 'Pune',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          time: '08:00',
          totalSeats: 40,
          availableSeats: 40,
          price: 500
        },
        {
          busNumber: 'DL01CD5678',
          from: 'Delhi',
          to: 'Jaipur',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '10:30',
          totalSeats: 45,
          availableSeats: 45,
          price: 600
        },
        {
          busNumber: 'KA03EF9012',
          from: 'Bangalore',
          to: 'Chennai',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '14:15',
          totalSeats: 50,
          availableSeats: 50,
          price: 750
        },
        {
          busNumber: 'MH14GH3456',
          from: 'Mumbai',
          to: 'Goa',
          date: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
          time: '22:00',
          totalSeats: 35,
          availableSeats: 35,
          price: 800
        },
        {
          busNumber: 'UP16IJ7890',
          from: 'Delhi',
          to: 'Agra',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '06:30',
          totalSeats: 40,
          availableSeats: 40,
          price: 400
        }
      ];

      await Bus.insertMany(sampleBuses);
      console.log('Sample buses added to database');
    }
  } catch (error) {
    console.error('Error initializing sample buses:', error);
  }
};

// Initialize sample buses on startup
initializeSampleBuses();

// Get booked seats for a specific bus
router.get('/booked-seats/:busId', async (req, res) => {
  try {
    const { busId } = req.params;
    
    const bookings = await Booking.find({
      busId: busId,
      status: 'confirmed'
    });
    
    const bookedSeats = bookings.flatMap(booking => booking.seatsBooked);
    
    res.json({
      message: 'Booked seats retrieved successfully',
      bookedSeats
    });
  } catch (error) {
    console.error('Get booked seats error:', error);
    res.status(500).json({ message: 'Server error retrieving booked seats' });
  }
});

// Search buses
router.get('/search', [
  query('from').optional().trim(),
  query('to').optional().trim(),
  query('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { from, to, date } = req.query;

    // Build search query
    let searchQuery = {};
    
    if (from) {
      searchQuery.from = new RegExp(from, 'i');
    }
    
    if (to) {
      searchQuery.to = new RegExp(to, 'i');
    }
    
    if (date) {
      const searchDate = new Date(date);
      searchQuery.date = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }

    // Only show buses with available seats
    searchQuery.availableSeats = { $gt: 0 };

    const buses = await Bus.find(searchQuery)
      .sort({ date: 1, time: 1 });

    res.json({
      message: 'Buses retrieved successfully',
      buses,
      count: buses.length
    });
  } catch (error) {
    console.error('Search buses error:', error);
    res.status(500).json({ message: 'Server error searching buses' });
  }
});

// Get all buses (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.json({
      message: 'All buses retrieved successfully',
      buses
    });
  } catch (error) {
    console.error('Get all buses error:', error);
    res.status(500).json({ message: 'Server error retrieving buses' });
  }
});

// Create new bus (Admin only)
router.post('/create', authenticate, authorize('admin'), [
  body('busNumber').trim().notEmpty().withMessage('Bus number is required'),
  body('from').trim().notEmpty().withMessage('Source city is required'),
  body('to').trim().notEmpty().withMessage('Destination city is required'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('totalSeats').isInt({ min: 1, max: 60 }).withMessage('Total seats must be between 1 and 60'),
  body('price').isFloat({ min: 1 }).withMessage('Price must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const busData = req.body;
    
    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber: busData.busNumber.toUpperCase() });
    if (existingBus) {
      return res.status(400).json({ 
        message: 'Bus with this number already exists' 
      });
    }

    const bus = new Bus(busData);
    await bus.save();

    res.status(201).json({
      message: 'Bus created successfully',
      bus
    });
  } catch (error) {
    console.error('Create bus error:', error);
    res.status(500).json({ message: 'Server error creating bus' });
  }
});

// Update bus (Admin only)
router.put('/update/:id', authenticate, authorize('admin'), [
  body('busNumber').optional().trim().notEmpty().withMessage('Bus number cannot be empty'),
  body('from').optional().trim().notEmpty().withMessage('Source city cannot be empty'),
  body('to').optional().trim().notEmpty().withMessage('Destination city cannot be empty'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('totalSeats').optional().isInt({ min: 1, max: 60 }).withMessage('Total seats must be between 1 and 60'),
  body('price').optional().isFloat({ min: 1 }).withMessage('Price must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        bus[key] = req.body[key];
      }
    });

    await bus.save();

    res.json({
      message: 'Bus updated successfully',
      bus
    });
  } catch (error) {
    console.error('Update bus error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bus ID' });
    }
    res.status(500).json({ message: 'Server error updating bus' });
  }
});

// Delete bus (Admin only)
router.delete('/delete/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    await Bus.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    console.error('Delete bus error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bus ID' });
    }
    res.status(500).json({ message: 'Server error deleting bus' });
  }
});

export default router;