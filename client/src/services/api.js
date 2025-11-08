import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden
          toast.error(data.message || 'Access denied');
          break;
          
        case 404:
          // Not found
          toast.error(data.message || 'Resource not found');
          break;
          
        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.msg || err.message);
            });
          } else {
            toast.error(data.message || 'Validation failed');
          }
          break;
          
        case 429:
          // Rate limit exceeded
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserBookings: (id, params) => api.get(`/users/${id}/bookings`, { params }),
  getUserNotifications: (id, params) => api.get(`/users/${id}/notifications`, { params }),
  markAllNotificationsRead: (id) => api.put(`/users/${id}/notifications/read-all`),
  getUserStats: () => api.get('/users/stats/overview'),
};

export const busesAPI = {
  getBuses: (params) => api.get('/buses', { params }),
  getBus: (id) => api.get(`/buses/${id}`),
  createBus: (data) => api.post('/buses', data),
  updateBus: (id, data) => api.put(`/buses/${id}`, data),
  deleteBus: (id) => api.delete(`/buses/${id}`),
  updateBusLocation: (id, location) => api.put(`/buses/${id}/location`, location),
  getAvailableSeats: (id, travelDate) => api.get(`/buses/${id}/available-seats`, { params: { travelDate } }),
  getBusesNearLocation: (lat, lng, maxDistance) => api.get('/buses/near-location', { 
    params: { lat, lng, maxDistance } 
  }),
};

export const driversAPI = {
  getDrivers: (params) => api.get('/drivers', { params }),
  getDriver: (id) => api.get(`/drivers/${id}`),
  createDriver: (data) => api.post('/drivers', data),
  updateDriver: (id, data) => api.put(`/drivers/${id}`, data),
  deleteDriver: (id) => api.delete(`/drivers/${id}`),
  updateDriverLocation: (id, location) => api.put(`/drivers/${id}/location`, location),
  getAvailableDrivers: () => api.get('/drivers/available'),
};

export const routesAPI = {
  getRoutes: (params) => api.get('/routes', { params }),
  getRoute: (id) => api.get(`/routes/${id}`),
  createRoute: (data) => api.post('/routes', data),
  updateRoute: (id, data) => api.put(`/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/routes/${id}`),
  calculateFare: (id, userRole) => api.get(`/routes/${id}/fare`, { params: { userRole } }),
  getRoutesNearLocation: (lat, lng, maxDistance) => api.get('/routes/near-location', { 
    params: { lat, lng, maxDistance } 
  }),
};

export const schedulesAPI = {
  getSchedules: (params) => api.get('/schedules', { params }),
  getSchedule: (id) => api.get(`/schedules/${id}`),
  createSchedule: (data) => api.post('/schedules', data),
  updateSchedule: (id, data) => api.put(`/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/schedules/${id}`),
  updateScheduleDelay: (id, delayData) => api.put(`/schedules/${id}/delay`, delayData),
  getTodaySchedules: () => api.get('/schedules/today'),
  getUpcomingSchedules: (hours) => api.get('/schedules/upcoming', { params: { hours } }),
};

export const bookingsAPI = {
  getBookings: (params) => api.get('/bookings', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (data) => api.post('/bookings', data),
  cancelBooking: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  completeBooking: (id) => api.put(`/bookings/${id}/complete`),
  getBusBookings: (busId, date) => api.get(`/bookings/bus/${busId}/date/${date}`),
  getBookingStats: (startDate, endDate) => api.get('/bookings/stats', { 
    params: { startDate, endDate } 
  }),
};

export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getNotification: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAsUnread: (id) => api.put(`/notifications/${id}/unread`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  createNotification: (data) => api.post('/notifications', data),
  createBulkNotifications: (data) => api.post('/notifications/bulk', data),
  sendNotificationsByRole: (data) => api.post('/notifications/by-role', data),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getNotificationStats: (startDate, endDate) => api.get('/notifications/stats', { 
    params: { startDate, endDate } 
  }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getBookingReport: (params) => api.get('/admin/reports/bookings', { params }),
  getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  getBusUtilizationReport: (params) => api.get('/admin/reports/buses', { params }),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getSystemHealth: () => api.get('/admin/system-health'),
};

// File upload helper
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
};

// Export the main api instance
export default api;
