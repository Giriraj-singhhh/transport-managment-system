import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { adminAPI, bookingsAPI, busesAPI, usersAPI } from '../../services/api';
import { Users, Bus, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery('adminDashboard', () =>
    adminAPI.getDashboard()
  );

  const { data: bookings } = useQuery('allBookings', () => bookingsAPI.getBookings());
  const { data: buses } = useQuery('allBuses', () => busesAPI.getBuses());
  const { data: users } = useQuery('allUsers', () => usersAPI.getUsers());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = dashboardData?.data || {
    totalUsers: users?.data?.users?.length || 0,
    totalBuses: buses?.data?.buses?.length || 0,
    totalBookings: bookings?.data?.bookings?.length || 0,
    totalRevenue: bookings?.data?.bookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - College Transport Management System</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of the transport management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Buses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBuses}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Bus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.totalRevenue}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">System running normally</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                View Reports
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                Manage Users
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

