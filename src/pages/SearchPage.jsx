import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bus } from 'lucide-react';
import BusSearch from '../components/Bus/BusSearch';
import BusCard from '../components/Bus/BusCard';
import SeatMap from '../components/Bus/SeatMap';
import { busAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showSeatMap, setShowSeatMap] = useState(false);

  useEffect(() => {
    // If coming from home page with search data, perform search
    if (location.state?.searchData) {
      handleSearch(location.state.searchData);
    }
  }, [location.state]);

  const handleSearch = async (searchData) => {
    setLoading(true);
    try {
      const response = await busAPI.searchBuses(searchData);
      setBuses(response.data.buses);
      
      if (response.data.buses.length === 0) {
        toast.info('No buses found for your search criteria');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error searching buses';
      toast.error(message);
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookBus = (bus) => {
    if (!user) {
      toast.error('Please login to book a bus');
      return;
    }
    setSelectedBus(bus);
    setShowSeatMap(true);
  };

  const handleBookingSuccess = () => {
    // Refresh the bus data to update available seats
    if (location.state?.searchData) {
      handleSearch(location.state.searchData);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <BusSearch onSearch={handleSearch} loading={loading} />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Searching for buses...</p>
        </div>
      )}

      {/* Results */}
      {!loading && buses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {buses.length} bus{buses.length !== 1 ? 'es' : ''} found
            </h2>
          </div>
          
          <div className="space-y-4">
            {buses.map((bus) => (
              <BusCard
                key={bus._id}
                bus={bus}
                onBook={handleBookBus}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && buses.length === 0 && (
        <div className="text-center py-12">
          <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No buses found for your search criteria.</p>
          <p className="text-gray-500">Try different cities or dates to find available buses.</p>
        </div>
      )}

      {/* Seat Map Modal */}
      {showSeatMap && selectedBus && (
        <SeatMap
          bus={selectedBus}
          onClose={() => {
            setShowSeatMap(false);
            setSelectedBus(null);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default SearchPage;