import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import { schedulesAPI } from '../../services/api';
import { Calendar, MapPin, Clock, Navigation } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DriverDashboard = () => {
  const { user } = useAuth();

  const { data: todaySchedules, isLoading } = useQuery(
    'todaySchedules',
    () => schedulesAPI.getTodaySchedules(),
    { enabled: !!user }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Driver Dashboard - College Transport Management System</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">Your schedule for today</p>
        </div>

        {todaySchedules?.data?.schedules?.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {todaySchedules.data.schedules.map((schedule) => (
              <div key={schedule._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      schedule.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : schedule.status === 'delayed'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {schedule.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {schedule.routeId?.name || 'Route'}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {schedule.departureTime} - {schedule.arrivalTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {schedule.routeId?.startLocation} → {schedule.routeId?.endLocation}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Navigation className="h-4 w-4 mr-2" />
                    Bus: {schedule.busId?.name || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules for today</h3>
            <p className="text-gray-600">You have no scheduled trips today</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DriverDashboard;

