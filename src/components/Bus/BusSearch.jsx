import React, { useState } from 'react';
import { Search, MapPin, Calendar, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';

const BusSearch = ({ onSearch, loading }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [errors, setErrors] = useState({});

  const popularCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Nagpur', 'Indore',
    'Surat', 'Kanpur', 'Patna', 'Bhopal', 'Vadodara', 'Coimbatore'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSwapCities = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!searchData.from.trim()) {
      newErrors.from = 'Source city is required';
    }

    if (!searchData.to.trim()) {
      newErrors.to = 'Destination city is required';
    }

    if (searchData.from.trim() === searchData.to.trim()) {
      newErrors.to = 'Source and destination cannot be the same';
    }

    if (!searchData.date) {
      newErrors.date = 'Travel date is required';
    } else if (new Date(searchData.date) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.date = 'Travel date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSearch(searchData);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Find Your Perfect Bus
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* From */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              From
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="from"
                value={searchData.from}
                onChange={handleChange}
                list="from-cities"
                placeholder="Enter source city"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.from ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <datalist id="from-cities">
                {popularCities.map(city => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            {errors.from && (
              <p className="text-sm text-red-600">{errors.from}</p>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex items-end justify-center pb-3">
            <button
              type="button"
              onClick={handleSwapCities}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Swap cities"
            >
              <ArrowRightLeft className="h-5 w-5" />
            </button>
          </div>

          {/* To */}
          <div className="space-y-2 md:-ml-8">
            <label className="block text-sm font-medium text-gray-700">
              To
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="to"
                value={searchData.to}
                onChange={handleChange}
                list="to-cities"
                placeholder="Enter destination city"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.to ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <datalist id="to-cities">
                {popularCities.map(city => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            {errors.to && (
              <p className="text-sm text-red-600">{errors.to}</p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="max-w-xs mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              name="date"
              value={searchData.date}
              onChange={handleChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.date && (
            <p className="text-sm text-red-600 mt-1">{errors.date}</p>
          )}
        </div>

        {/* Search Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>{loading ? 'Searching...' : 'Search Buses'}</span>
          </button>
        </div>
      </form>

      {/* Popular Routes */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Routes</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'Mumbai → Pune',
            'Delhi → Jaipur',
            'Bangalore → Chennai',
            'Hyderabad → Bangalore',
            'Mumbai → Goa',
            'Delhi → Agra'
          ].map(route => (
            <button
              key={route}
              type="button"
              onClick={() => {
                const [from, to] = route.split(' → ');
                setSearchData(prev => ({ ...prev, from, to }));
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              {route}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusSearch;