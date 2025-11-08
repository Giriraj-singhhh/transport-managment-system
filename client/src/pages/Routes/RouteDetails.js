import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { routesAPI } from '../../services/api';
import { Navigation, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const RouteDetails = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery(['route', id], () => routesAPI.getRoute(id));

  const route = data?.data?.route;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Route not found</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{route.name} - Route Details</title>
      </Helmet>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-4">
                <Navigation className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{route.name}</h1>
                <p className="text-gray-600">
                  {route.startLocation} → {route.endLocation}
                </p>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                route.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {route.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Route Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Start Location</p>
                    <p className="font-medium text-gray-900">{route.startLocation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">End Location</p>
                    <p className="font-medium text-gray-900">{route.endLocation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Time</p>
                    <p className="font-medium text-gray-900">{route.estimatedTime} minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-medium text-gray-900">{route.distance} km</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Fare Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Base Fare</p>
                    <p className="font-medium text-gray-900">₹{route.fare?.base || 'N/A'}</p>
                  </div>
                </div>
                {route.fare?.student && (
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Student Fare</p>
                      <p className="font-medium text-gray-900">₹{route.fare.student}</p>
                    </div>
                  </div>
                )}
                {route.fare?.staff && (
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Staff Fare</p>
                      <p className="font-medium text-gray-900">₹{route.fare.staff}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {route.stops && route.stops.length > 0 && (
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Stops</h2>
                <div className="space-y-2">
                  {route.stops.map((stop, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{stop.name}</p>
                        {stop.time && <p className="text-sm text-gray-600">{stop.time}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RouteDetails;

