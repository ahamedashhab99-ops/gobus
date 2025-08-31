import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, IndianRupee, Clock, Ticket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI } from '../services/api';
import { format, isAfter, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.bookings);
    } catch (error) {
      const message = error.response?.data?.message || 'Error fetching bookings';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh bookings
    } catch (error) {
      const message = error.response?.data?.message || 'Error cancelling booking';
      toast.error(message);
    }
  };

  const upcomingBookings = bookings.filter(
    booking => booking.status === 'confirmed' && 
    isAfter(parseISO(booking.busId.date), new Date())
  );

  const pastBookings = bookings.filter(
    booking => !isAfter(parseISO(booking.busId.date), new Date()) ||
    booking.status === 'cancelled'
  );

  const stats = {
    totalBookings: bookings.length,
    upcomingTrips: upcomingBookings.length,
    totalSpent: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, booking) => sum + booking.totalAmount, 0),
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Manage your bus bookings and travel history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Ticket className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingTrips}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <IndianRupee className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelledBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming Trips ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Booking History ({pastBookings.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'upcoming' && (
            <UpcomingBookings 
              bookings={upcomingBookings} 
              onCancel={handleCancelBooking}
            />
          )}
          {activeTab === 'history' && (
            <BookingHistory bookings={pastBookings} />
          )}
        </div>
      </div>
    </div>
  );
};

const UpcomingBookings = ({ bookings, onCancel }) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No upcoming bookings</p>
        <p className="text-gray-500">Book your next trip to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard 
          key={booking._id} 
          booking={booking} 
          showCancel={true}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};

const BookingHistory = ({ bookings }) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No booking history</p>
        <p className="text-gray-500">Your past bookings will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard 
          key={booking._id} 
          booking={booking} 
          showCancel={false}
        />
      ))}
    </div>
  );
};

const BookingCard = ({ booking, showCancel, onCancel }) => {
  const isUpcoming = isAfter(parseISO(booking.busId.date), new Date());
  const isCancelled = booking.status === 'cancelled';

  return (
    <div className={`border rounded-xl p-6 transition-all hover:shadow-md ${
      isCancelled ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {booking.busId.busNumber}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              booking.status === 'confirmed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
            </span>
          </div>

          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{booking.busId.from} → {booking.busId.to}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{format(parseISO(booking.busId.date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{booking.busId.time}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Seats:</span> {booking.seatsBooked.join(', ')}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Booking Date:</span> {format(parseISO(booking.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">₹{booking.totalAmount}</p>
              <p className="text-sm text-gray-600">
                {booking.seatsBooked.length} seat{booking.seatsBooked.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {showCancel && !isCancelled && (
          <div className="lg:ml-6">
            <button
              onClick={() => onCancel(booking._id)}
              className="w-full lg:w-auto px-6 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Cancel Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;