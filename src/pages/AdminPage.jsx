import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Bus, Users, IndianRupee, Calendar, X } from 'lucide-react';
import { busAPI, bookingAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('buses');
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showBusForm, setShowBusForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [busResponse, bookingResponse] = await Promise.all([
        busAPI.getAllBuses(),
        bookingAPI.getAllBookings()
      ]);
      
      setBuses(busResponse.data.buses);
      setBookings(bookingResponse.data.bookings);
      setStats(bookingResponse.data.stats);
    } catch (error) {
      const message = error.response?.data?.message || 'Error fetching data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBus = async (busId) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;

    try {
      await busAPI.deleteBus(busId);
      toast.success('Bus deleted successfully');
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Error deleting bus';
      toast.error(message);
    }
  };

  const handleBusFormSuccess = () => {
    setShowBusForm(false);
    setEditingBus(null);
    fetchData();
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100">Manage buses, bookings, and system operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Bus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Buses</p>
              <p className="text-2xl font-bold text-gray-900">{buses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <IndianRupee className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('buses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'buses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Bus Management ({buses.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Bookings ({bookings.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'buses' && (
            <BusManagement 
              buses={buses}
              onEdit={(bus) => {
                setEditingBus(bus);
                setShowBusForm(true);
              }}
              onDelete={handleDeleteBus}
              onAdd={() => {
                setEditingBus(null);
                setShowBusForm(true);
              }}
            />
          )}
          {activeTab === 'bookings' && (
            <BookingManagement bookings={bookings} />
          )}
        </div>
      </div>

      {/* Bus Form Modal */}
      {showBusForm && (
        <BusForm
          bus={editingBus}
          onClose={() => {
            setShowBusForm(false);
            setEditingBus(null);
          }}
          onSuccess={handleBusFormSuccess}
        />
      )}
    </div>
  );
};

const BusManagement = ({ buses, onEdit, onDelete, onAdd }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Bus Fleet Management</h3>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Bus</span>
        </button>
      </div>

      {buses.length === 0 ? (
        <div className="text-center py-12">
          <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No buses added yet</p>
          <p className="text-gray-500">Add your first bus to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {buses.map((bus) => (
            <div key={bus._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">{bus.busNumber}</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(bus)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(bus._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Route:</span> {bus.from} → {bus.to}</p>
                <p><span className="font-medium">Date:</span> {format(new Date(bus.date), 'MMM dd, yyyy')}</p>
                <p><span className="font-medium">Time:</span> {bus.time}</p>
                <p><span className="font-medium">Seats:</span> {bus.availableSeats}/{bus.totalSeats} available</p>
                <p><span className="font-medium">Price:</span> ₹{bus.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BookingManagement = ({ bookings }) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No bookings yet</p>
        <p className="text-gray-500">Bookings will appear here once users start booking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">All Bookings</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bus Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {booking.userId.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.userId.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {booking.busId.busNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.busId.from} → {booking.busId.to}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(booking.busId.date), 'MMM dd, yyyy')} at {booking.busId.time}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.seatsBooked.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ₹{booking.totalAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BusForm = ({ bus, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    busNumber: bus?.busNumber || '',
    from: bus?.from || '',
    to: bus?.to || '',
    date: bus?.date ? format(new Date(bus.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    time: bus?.time || '',
    totalSeats: bus?.totalSeats || 40,
    price: bus?.price || 500
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.busNumber.trim()) {
      newErrors.busNumber = 'Bus number is required';
    }
    if (!formData.from.trim()) {
      newErrors.from = 'Source city is required';
    }
    if (!formData.to.trim()) {
      newErrors.to = 'Destination city is required';
    }
    if (formData.from === formData.to) {
      newErrors.to = 'Source and destination cannot be the same';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    if (!formData.totalSeats || formData.totalSeats < 1 || formData.totalSeats > 60) {
      newErrors.totalSeats = 'Total seats must be between 1 and 60';
    }
    if (!formData.price || formData.price < 1) {
      newErrors.price = 'Price must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (bus) {
        await busAPI.updateBus(bus._id, formData);
        toast.success('Bus updated successfully');
      } else {
        await busAPI.createBus(formData);
        toast.success('Bus created successfully');
      }
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.message || 'Error saving bus';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {bus ? 'Edit Bus' : 'Add New Bus'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Number
            </label>
            <input
              type="text"
              name="busNumber"
              value={formData.busNumber}
              onChange={handleChange}
              placeholder="e.g., MH12AB1234"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.busNumber ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.busNumber && <p className="text-sm text-red-600 mt-1">{errors.busNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="Source city"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.from ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.from && <p className="text-sm text-red-600 mt-1">{errors.from}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="Destination city"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.to ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.to && <p className="text-sm text-red-600 mt-1">{errors.to}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={format(new Date(), 'yyyy-MM-dd')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.time ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.time && <p className="text-sm text-red-600 mt-1">{errors.time}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Seats
              </label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                min="1"
                max="60"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.totalSeats ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.totalSeats && <p className="text-sm text-red-600 mt-1">{errors.totalSeats}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : bus ? 'Update Bus' : 'Create Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;