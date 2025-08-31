import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Shield, Clock, Headphones, Star, Users, MapPin } from 'lucide-react';
import BusSearch from '../components/Bus/BusSearch';

const HomePage = () => {
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (searchData) => {
    setSearchLoading(true);
    // Simulate search delay
    setTimeout(() => {
      setSearchLoading(false);
      navigate('/search', { state: { searchData } });
    }, 1000);
  };

  const features = [
    {
      icon: Bus,
      title: 'Wide Network',
      description: 'Access to thousands of buses across all major routes in India',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Safe and secure payment gateway with multiple payment options',
      color: 'emerald'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Get live bus tracking and instant booking confirmations',
      color: 'orange'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round the clock customer support for all your travel needs',
      color: 'purple'
    }
  ];

  const stats = [
    { label: 'Happy Customers', value: '10M+', icon: Users },
    { label: 'Bus Routes', value: '50K+', icon: MapPin },
    { label: 'Bus Operators', value: '2K+', icon: Bus },
    { label: 'Customer Rating', value: '4.8★', icon: Star }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai',
      rating: 5,
      comment: 'Excellent service! Booking was smooth and the bus was on time. Highly recommended!'
    },
    {
      name: 'Rajesh Kumar',
      location: 'Delhi',
      rating: 5,
      comment: 'Great platform for bus bookings. The seat selection feature is very convenient.'
    },
    {
      name: 'Anita Patel',
      location: 'Bangalore',
      rating: 4,
      comment: 'Good experience overall. Customer support was helpful when I needed to change my booking.'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Book Your Bus Tickets
          <span className="text-blue-600 block">Hassle-Free</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          India's most trusted bus booking platform. Find and book buses to thousands of destinations 
          across the country with real-time availability and instant confirmation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/search"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Find Buses Now
          </Link>
          <Link
            to="/signup"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Search Section */}
      <section>
        <BusSearch onSearch={handleSearch} loading={searchLoading} />
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose GoBus?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the best in bus booking with our premium features designed for your convenience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              emerald: 'bg-emerald-100 text-emerald-600',
              orange: 'bg-orange-100 text-orange-600',
              purple: 'bg-purple-100 text-purple-600'
            };

            return (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClasses[feature.color]}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-16 rounded-2xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Trusted by Millions
          </h2>
          <p className="text-blue-100 text-lg">
            Join millions of satisfied customers who trust GoBus for their travel needs
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <Icon className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600">
            Real experiences from real travelers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 rounded-2xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Book your bus tickets now and experience hassle-free travel with GoBus
        </p>
        <Link
          to="/search"
          className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
        >
          <Bus className="h-5 w-5 mr-2" />
          Book Your Bus Now
        </Link>
      </section>
    </div>
  );
};

export default HomePage;