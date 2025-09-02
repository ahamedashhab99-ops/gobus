import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  createAdmin: () => api.post('/auth/create-admin'),
};

// Bus API
export const busAPI = {
  searchBuses: (params) => api.get('/buses/search', { params }),
  getBookedSeats: (busId) => api.get(`/buses/booked-seats/${busId}`),
  getAllBuses: () => api.get('/buses'),
  createBus: (busData) => api.post('/buses/create', busData),
  updateBus: (id, busData) => api.put(`/buses/update/${id}`, busData),
  deleteBus: (id) => api.delete(`/buses/delete/${id}`),
};

// Booking API
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings/create', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getAllBookings: () => api.get('/bookings/all'),
  cancelBooking: (id) => api.patch(`/bookings/cancel/${id}`),
};

export default api;