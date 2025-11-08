import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import { bookingsAPI, schedulesAPI } from '../../services/api';
import { Calendar, Bus, MapPin, Clock, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useQuery(
    'userBookings',
    async () => {
      const response = await bookingsAPI.getBookings({ limit: 100 });
      return response.data; // axios extracts .data, so we get { status, data: { bookings, pagination } }
    },
    { 
      enabled: !!user,
      retry: 1,
      refetchOnMount: true
    }
  );

  const { data: schedulesData, isLoading: schedulesLoading, error: schedulesError } = useQuery(
    'upcomingSchedules',
    async () => {
      const response = await schedulesAPI.getUpcomingSchedules(24);
      return response.data; // axios extracts .data
    },
    { 
      enabled: !!user,
      retry: 1,
      refetchOnMount: true
    }
  );

  // Extract bookings and schedules from nested data structure
  const bookings = bookingsData?.data?.bookings || [];
  const schedules = schedulesData?.data?.schedules || [];

  if (bookingsLoading || schedulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show errors if any
  if (bookingsError || schedulesError) {
    console.error('Dashboard errors:', { bookingsError, schedulesError });
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - College Transport Management System</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your transport bookings today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {bookings.length || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {bookings.filter(b => 
                    new Date(b.travelDate) >= new Date() && b.status === 'confirmed'
                  ).length || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Bus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Routes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {schedules.length || 0}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {bookings.filter(b => {
                    const bookingDate = new Date(b.bookingDate || b.createdAt);
                    const now = new Date();
                    return bookingDate.getMonth() === now.getMonth() && 
                           bookingDate.getFullYear() === now.getFullYear();
                  }).length || 0}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <Bus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Seat {booking.seatNumber} - {booking.busId?.name || 'Bus'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.travelDate).toLocaleDateString()} • {booking.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{booking.amount}</p>
                      <p className="text-sm text-gray-600 capitalize">{booking.paymentStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bookings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Schedules */}
        {schedules.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Schedules</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {schedules.slice(0, 5).map((schedule) => (
                  <div
                    key={schedule._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {schedule.routeId?.name || 'Route'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {schedule.departureTime} - {schedule.arrivalTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{schedule.fare}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;

