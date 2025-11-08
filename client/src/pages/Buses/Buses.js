import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { busesAPI } from '../../services/api';
import { Bus, Search, MapPin, Users } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Buses = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery(
    'buses',
    async () => {
      const response = await busesAPI.getBuses();
      return response.data; // axios extracts .data
    },
    {
      refetchOnMount: true,
      retry: 1
    }
  );

  const buses = data?.data?.buses || [];

  const filteredBuses = buses.filter(bus =>
    bus.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <title>Buses - College Transport Management System</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buses</h1>
          <p className="mt-2 text-gray-600">View all available buses</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search buses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {filteredBuses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuses.map((bus) => (
              <Link
                key={bus._id}
                to={`/app/buses/${bus._id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Bus className="h-6 w-6 text-blue-600" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{bus.name}</h3>
                <p className="text-gray-600 mb-4">Bus #{bus.busNumber}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    Capacity: {bus.capacity} seats
                  </div>
                  {bus.driverId && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      Driver: {bus.driverId?.name || 'Assigned'}
                    </div>
                  )}
                  {bus.routeId && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      Route: {bus.routeId?.name || 'Assigned'}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No buses found</h3>
            <p className="text-gray-600">Try adjusting your search</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Buses;

