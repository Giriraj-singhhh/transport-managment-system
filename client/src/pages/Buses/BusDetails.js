import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { busesAPI } from '../../services/api';
import { Bus, MapPin, Users, Wifi, Zap, UserCheck } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const BusDetails = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery(['bus', id], () => busesAPI.getBus(id));

  const bus = data?.data?.bus;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Bus not found</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{bus.name} - Bus Details</title>
      </Helmet>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-4">
                <Bus className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{bus.name}</h1>
                <p className="text-gray-600">Bus #{bus.busNumber}</p>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                bus.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : bus.status === 'maintenance'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {bus.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="font-medium text-gray-900">{bus.capacity} seats</p>
                  </div>
                </div>
                {bus.driverId && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Driver</p>
                      <p className="font-medium text-gray-900">
                        {bus.driverId?.name || 'Assigned'}
                      </p>
                    </div>
                  </div>
                )}
                {bus.routeId && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Route</p>
                      <p className="font-medium text-gray-900">
                        {bus.routeId?.name || 'Assigned'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {bus.features && bus.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {bus.features.includes('wifi') && (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <Wifi className="h-4 w-4" />
                      <span>WiFi</span>
                    </span>
                  )}
                  {bus.features.includes('ac') && (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <span>AC</span>
                    </span>
                  )}
                  {bus.features.includes('charging') && (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <Zap className="h-4 w-4" />
                      <span>Charging</span>
                    </span>
                  )}
                  {bus.features.includes('wheelchair_accessible') && (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <UserCheck className="h-4 w-4" />
                      <span>Wheelchair Accessible</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {bus.specifications && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                <div className="space-y-2">
                  {bus.specifications.make && (
                    <p className="text-sm">
                      <span className="text-gray-500">Make:</span>{' '}
                      <span className="font-medium">{bus.specifications.make}</span>
                    </p>
                  )}
                  {bus.specifications.model && (
                    <p className="text-sm">
                      <span className="text-gray-500">Model:</span>{' '}
                      <span className="font-medium">{bus.specifications.model}</span>
                    </p>
                  )}
                  {bus.specifications.year && (
                    <p className="text-sm">
                      <span className="text-gray-500">Year:</span>{' '}
                      <span className="font-medium">{bus.specifications.year}</span>
                    </p>
                  )}
                  {bus.specifications.fuelType && (
                    <p className="text-sm">
                      <span className="text-gray-500">Fuel Type:</span>{' '}
                      <span className="font-medium capitalize">{bus.specifications.fuelType}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {bus.location && bus.location.isOnline && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Current Location</h2>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(bus.location.lastUpdated).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 font-medium">Online</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BusDetails;

