import React from 'react';
import { Clock, Users, MapPin, IndianRupee, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const BusCard = ({ bus, onBook }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Bus Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{bus.busNumber}</h3>
            <div className="flex items-center space-x-1 text-emerald-600">
              <IndianRupee className="h-5 w-5" />
              <span className="text-2xl font-bold">₹{bus.price}</span>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{bus.from}</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{bus.to}</span>
            </div>
          </div>

          {/* Time and Details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {bus.time}
                </div>
                <div className="text-sm text-gray-500">Departure</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-emerald-600">
                  ₹{bus.price}
                </div>
                <div className="text-sm text-gray-500">per seat</div>
              </div>
            </div>

            {/* Date and Seats */}
            <div className="text-right space-y-2">
              <div className="flex items-center space-x-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{formatDate(bus.date)}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  {bus.availableSeats} seats available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price and Book Button */}
        <div className="lg:ml-8 text-center lg:text-right">
          <div className="mb-3">
            <div className="text-3xl font-bold text-emerald-600">₹{bus.price}</div>
            <div className="text-sm text-gray-500">per seat</div>
          </div>
          <button
            onClick={() => onBook(bus)}
            disabled={bus.availableSeats === 0}
            className={`w-full lg:w-auto px-8 py-3 font-medium rounded-lg transition-all duration-200 ${
              bus.availableSeats === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {bus.availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
          </button>
        </div>
      </div>

      {/* Availability Bar */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Seat Availability</span>
          <span>{bus.availableSeats}/{bus.totalSeats} available</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              bus.availableSeats / bus.totalSeats > 0.5
                ? 'bg-emerald-500'
                : bus.availableSeats / bus.totalSeats > 0.2
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{
              width: `${(bus.availableSeats / bus.totalSeats) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BusCard;