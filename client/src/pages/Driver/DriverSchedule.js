import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { schedulesAPI } from '../../services/api';
import { Calendar, Clock, MapPin, Bus } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DriverSchedule = () => {
  const { data, isLoading } = useQuery('driverSchedules', () =>
    schedulesAPI.getSchedules()
  );

  const schedules = data?.data?.schedules || [];

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
        <title>My Schedule - Driver Dashboard</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="mt-2 text-gray-600">View all your assigned schedules</p>
        </div>

        {schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {schedule.routeId?.name || 'Route'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {schedule.routeId?.startLocation} → {schedule.routeId?.endLocation}
                      </p>
                    </div>
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
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {schedule.departureTime} - {schedule.arrivalTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Bus className="h-4 w-4 mr-2" />
                    {schedule.busId?.name || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    ₹{schedule.fare}
                  </div>
                </div>
                {schedule.dayOfWeek && schedule.dayOfWeek.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Days:</p>
                    <div className="flex flex-wrap gap-2">
                      {schedule.dayOfWeek.map((day, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
            <p className="text-gray-600">You don't have any assigned schedules yet</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DriverSchedule;

