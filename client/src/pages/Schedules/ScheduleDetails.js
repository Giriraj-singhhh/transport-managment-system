import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { schedulesAPI } from '../../services/api';
import { Calendar, Clock, Bus, MapPin, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ScheduleDetails = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery(['schedule', id], () =>
    schedulesAPI.getSchedule(id)
  );

  const schedule = data?.data?.schedule;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Schedule not found</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Schedule Details - College Transport Management System</title>
      </Helmet>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {schedule.routeId?.name || 'Schedule'}
                </h1>
                <p className="text-gray-600">
                  {schedule.departureTime} - {schedule.arrivalTime}
                </p>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                schedule.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : schedule.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : schedule.status === 'delayed'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {schedule.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Schedule Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Departure Time</p>
                    <p className="font-medium text-gray-900">{schedule.departureTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Arrival Time</p>
                    <p className="font-medium text-gray-900">{schedule.arrivalTime}</p>
                  </div>
                </div>
                {schedule.dayOfWeek && schedule.dayOfWeek.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Days of Week</p>
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
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Route & Bus Information</h2>
              <div className="space-y-3">
                {schedule.routeId && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Route</p>
                      <p className="font-medium text-gray-900">
                        {schedule.routeId.startLocation} → {schedule.routeId.endLocation}
                      </p>
                    </div>
                  </div>
                )}
                {schedule.busId && (
                  <div className="flex items-center space-x-3">
                    <Bus className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Bus</p>
                      <p className="font-medium text-gray-900">
                        {schedule.busId.name} ({schedule.busId.busNumber})
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fare</p>
                    <p className="font-medium text-gray-900">₹{schedule.fare}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Bus className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="font-medium text-gray-900">{schedule.capacity} seats</p>
                  </div>
                </div>
              </div>
            </div>

            {schedule.delay && (
              <div className="md:col-span-2 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Delay Information</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This schedule has been delayed by {schedule.delay} minutes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleDetails;

