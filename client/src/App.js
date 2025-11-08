import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';

// Public pages
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import Contact from './pages/Public/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Protected pages
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import Bookings from './pages/Bookings/Bookings';
import BookingDetails from './pages/Bookings/BookingDetails';
import NewBooking from './pages/Bookings/NewBooking';
import Buses from './pages/Buses/Buses';
import BusDetails from './pages/Buses/BusDetails';
import RoutesPage from './pages/Routes/Routes';
import RouteDetails from './pages/Routes/RouteDetails';
import Schedules from './pages/Schedules/Schedules';
import ScheduleDetails from './pages/Schedules/ScheduleDetails';
import LiveTracking from './pages/Tracking/LiveTracking';
import Notifications from './pages/Notifications/Notifications';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminBuses from './pages/Admin/AdminBuses';
import AdminDrivers from './pages/Admin/AdminDrivers';
import AdminRoutes from './pages/Admin/AdminRoutes';
import AdminSchedules from './pages/Admin/AdminSchedules';
import AdminBookings from './pages/Admin/AdminBookings';
import AdminReports from './pages/Admin/AdminReports';
import AdminSettings from './pages/Admin/AdminSettings';

// Driver pages
import DriverDashboard from './pages/Driver/DriverDashboard';
import DriverSchedule from './pages/Driver/DriverSchedule';
import DriverLocation from './pages/Driver/DriverLocation';

// Error pages
import NotFound from './pages/Error/NotFound';
import Unauthorized from './pages/Error/Unauthorized';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>College Transport Management System</title>
        <meta name="description" content="Efficient college transport management with real-time tracking, booking system, and comprehensive admin controls." />
        <meta name="keywords" content="college transport, bus booking, student transport, campus transport, bus tracking" />
        <meta property="og:title" content="College Transport Management System" />
        <meta property="og:description" content="Efficient college transport management with real-time tracking, booking system, and comprehensive admin controls." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="College Transport Management System" />
        <meta name="twitter:description" content="Efficient college transport management with real-time tracking, booking system, and comprehensive admin controls." />
      </Helmet>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
        <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Common routes for all authenticated users */}
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/new" element={<NewBooking />} />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="buses" element={<Buses />} />
          <Route path="buses/:id" element={<BusDetails />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="routes/:id" element={<RouteDetails />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="schedules/:id" element={<ScheduleDetails />} />
          <Route path="tracking" element={<LiveTracking />} />
          <Route path="notifications" element={<Notifications />} />

          {/* Admin routes */}
          <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="admin/buses" element={<ProtectedRoute roles={['admin']}><AdminBuses /></ProtectedRoute>} />
          <Route path="admin/drivers" element={<ProtectedRoute roles={['admin']}><AdminDrivers /></ProtectedRoute>} />
          <Route path="admin/routes" element={<ProtectedRoute roles={['admin']}><AdminRoutes /></ProtectedRoute>} />
          <Route path="admin/schedules" element={<ProtectedRoute roles={['admin']}><AdminSchedules /></ProtectedRoute>} />
          <Route path="admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookings /></ProtectedRoute>} />
          <Route path="admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />

          {/* Driver routes */}
          <Route path="driver" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="driver/schedule" element={<ProtectedRoute roles={['driver']}><DriverSchedule /></ProtectedRoute>} />
          <Route path="driver/location" element={<ProtectedRoute roles={['driver']}><DriverLocation /></ProtectedRoute>} />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
