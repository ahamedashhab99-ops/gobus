# MERN Stack Bus Booking System

A comprehensive bus booking system built with MongoDB, Express.js, React.js, and Node.js.

## Features

### User Authentication
- JWT-based authentication system
- User registration and login
- Role-based access control (Admin/User)
- Password hashing with bcrypt

### Bus Management (Admin)
- Add, update, and delete buses
- Manage bus routes, schedules, and pricing
- Real-time seat availability tracking

### Booking System
- Search buses by source, destination, and date
- Interactive seat selection with visual seat map
- Real-time seat availability updates
- Booking confirmation and management

### User Dashboard
- View booking history (past and upcoming)
- Cancel bookings (with time restrictions)
- Profile management

### Admin Dashboard
- Comprehensive bus fleet management
- View all bookings and revenue statistics
- User management capabilities

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gobus
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Install frontend dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run client
```

The frontend will run on `http://localhost:5173`

### Run Both Servers Concurrently

To run both backend and frontend servers simultaneously:
```bash
npm run dev
```

## Database Schema

### Users Collection
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required, 10 digits),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Buses Collection
```javascript
{
  busNumber: String (required, uppercase),
  from: String (required),
  to: String (required),
  date: Date (required),
  time: String (required, HH:MM format),
  totalSeats: Number (required, 1-60),
  availableSeats: Number (required),
  price: Number (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Bookings Collection
```javascript
{
  userId: ObjectId (ref: 'User', required),
  busId: ObjectId (ref: 'Bus', required),
  seatsBooked: [Number] (required),
  totalAmount: Number (required),
  status: String (enum: ['confirmed', 'cancelled'], default: 'confirmed'),
  paymentStatus: String (enum: ['pending', 'completed', 'failed'], default: 'completed'),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/create-admin` - Create admin user

### Bus Routes
- `GET /api/buses/search` - Search buses with filters
- `GET /api/buses` - Get all buses (admin only)
- `POST /api/buses/create` - Create bus (admin only)
- `PUT /api/buses/update/:id` - Update bus (admin only)
- `DELETE /api/buses/delete/:id` - Delete bus (admin only)

### Booking Routes
- `POST /api/bookings/create` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/all` - Get all bookings (admin only)
- `PATCH /api/bookings/cancel/:id` - Cancel booking

## Features in Detail

### Search & Filter System
- Search buses by source, destination, and travel date
- Filter by price range and departure time
- Sort by price, departure time, duration, or available seats

### Seat Selection
- Visual seat map with 2+2 configuration
- Real-time seat availability
- Interactive seat selection
- Prevent double booking

### Booking Management
- Instant booking confirmation
- Email notifications (ready for integration)
- Cancellation with time restrictions (2 hours before departure)
- Booking history with status tracking

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected routes and API endpoints
- Role-based access control

## Demo Accounts

For testing purposes, you can create demo accounts:

### Admin Account
- Email: admin@gobus.com
- Password: admin123
- Role: admin

### Regular User Account
- Email: user@gobus.com
- Password: user123
- Role: user

## Production Deployment

### Environment Variables for Production
```env
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secure-jwt-secret-key
NODE_ENV=production
```

### Build for Production
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.