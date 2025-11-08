import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { busesAPI } from '../../services/api';
import { Bus, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminBuses = () => {
  const { data, isLoading } = useQuery('adminBuses', () => busesAPI.getBuses());

  const buses = data?.data?.buses || [];

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
        <title>Manage Buses - Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Buses</h1>
            <p className="mt-2 text-gray-600">View and manage all buses</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add Bus</span>
          </button>
        </div>

        {buses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus) => (
              <div key={bus._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Bus className="h-6 w-6 text-blue-600" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bus.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {bus.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{bus.name}</h3>
                <p className="text-gray-600 mb-4">Bus #{bus.busNumber}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">Capacity: {bus.capacity} seats</p>
                  {bus.driverId && (
                    <p className="text-gray-600">Driver: {bus.driverId?.name || 'Assigned'}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No buses found</h3>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminBuses;

