import React, { useState, useEffect } from 'react';
import { X, User, CreditCard, Bus } from 'lucide-react';
import { bookingAPI, busAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SeatMap = ({ bus, onClose, onBookingSuccess }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSeats, setFetchingSeats] = useState(true);

  useEffect(() => {
    fetchBookedSeats();
  }, [bus._id]);

  const fetchBookedSeats = async () => {
    try {
      const response = await busAPI.getBookedSeats(bus._id);
      setBookedSeats(response.data.bookedSeats);
    } catch (error) {
      console.error('Error fetching booked seats:', error);
      toast.error('Error loading seat information');
    } finally {
      setFetchingSeats(false);
    }
  };

  const generateSeats = () => {
    const seats = [];
    const seatsPerRow = 4; // 2+2 configuration
    const totalRows = Math.ceil(bus.totalSeats / seatsPerRow);

    for (let row = 0; row < totalRows; row++) {
      const rowSeats = [];
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatNumber = row * seatsPerRow + seat + 1;
        if (seatNumber <= bus.totalSeats) {
          rowSeats.push({
            number: seatNumber,
            isBooked: bookedSeats.includes(seatNumber),
            isSelected: selectedSeats.includes(seatNumber),
          });
        }
      }
      seats.push(rowSeats);
    }
    return seats;
  };

  const toggleSeat = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) {
      toast.error('This seat is already booked');
      return;
    }

    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        busId: bus._id,
        seatsBooked: selectedSeats
      };

      await bookingAPI.createBooking(bookingData);
      toast.success('Booking confirmed successfully!');
      onBookingSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Booking failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingSeats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading seat information...</span>
          </div>
        </div>
      </div>
    );
  }

  const seatRows = generateSeats();
  const totalAmount = selectedSeats.length * bus.price;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Select Seats</h3>
            <p className="text-gray-600">{bus.busNumber} - {bus.from} to {bus.to}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(bus.date), 'MMM dd, yyyy')} at {bus.time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Driver Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-10 bg-gray-800 text-white text-sm rounded-t-lg font-medium">
              <Bus className="h-4 w-4 mr-2" />
              Driver
            </div>
          </div>

          {/* Seat Map */}
          <div className="space-y-3 mb-8">
            {seatRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center space-x-2">
                {/* Left side seats */}
                <div className="flex space-x-2">
                  {row.slice(0, 2).map(seat => (
                    <button
                      key={seat.number}
                      onClick={() => toggleSeat(seat.number)}
                      disabled={seat.isBooked}
                      className={`w-12 h-12 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
                        seat.isBooked
                          ? 'bg-red-500 border-red-600 text-white cursor-not-allowed'
                          : seat.isSelected
                          ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 hover:scale-105'
                      }`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-8 text-center text-xs text-gray-400 font-medium">
                  {rowIndex === 0 && 'AISLE'}
                </div>

                {/* Right side seats */}
                <div className="flex space-x-2">
                  {row.slice(2, 4).map(seat => (
                    <button
                      key={seat.number}
                      onClick={() => toggleSeat(seat.number)}
                      disabled={seat.isBooked}
                      className={`w-12 h-12 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
                        seat.isBooked
                          ? 'bg-red-500 border-red-600 text-white cursor-not-allowed'
                          : seat.isSelected
                          ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 hover:scale-105'
                      }`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-8 mb-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 border-2 border-blue-700 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 border-2 border-red-600 rounded"></div>
              <span>Booked</span>
            </div>
          </div>

          {/* Booking Summary */}
          {selectedSeats.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Selected Seats:</span>
                </div>
                <span className="font-bold text-blue-600 text-lg">
                  {selectedSeats.sort((a, b) => a - b).join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">
                  {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} × ₹{bus.price}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{totalAmount}
                </span>
              </div>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0 || loading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
          >
            <CreditCard className="h-5 w-5" />
            <span>
              {loading 
                ? 'Processing Booking...' 
                : selectedSeats.length === 0 
                ? 'Select Seats to Continue' 
                : `Confirm Booking - ₹${totalAmount}`
              }
            </span>
          </button>

          {/* Bus Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Total Seats:</span> {bus.totalSeats}
              </div>
              <div>
                <span className="font-medium">Available:</span> {bus.availableSeats}
              </div>
              <div>
                <span className="font-medium">Price per seat:</span> ₹{bus.price}
              </div>
              <div>
                <span className="font-medium">Booked Seats:</span> {bookedSeats.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;