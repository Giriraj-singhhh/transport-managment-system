import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { routesAPI } from '../../services/api';
import { Navigation, Search, MapPin, Clock, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Routes = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery(
    'routes',
    async () => {
      const response = await routesAPI.getRoutes();
      return response.data; // axios extracts .data
    },
    {
      refetchOnMount: true,
      retry: 1
    }
  );

  const routes = data?.data?.routes || [];

  const filteredRoutes = routes.filter(route =>
    route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.startLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.endLocation?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <title>Routes - College Transport Management System</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routes</h1>
          <p className="mt-2 text-gray-600">View all available routes</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {filteredRoutes.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRoutes.map((route) => (
              <Link
                key={route._id}
                to={`/app/routes/${route._id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Navigation className="h-6 w-6 text-blue-600" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      route.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {route.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{route.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {route.startLocation} → {route.endLocation}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {route.estimatedTime} minutes
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ₹{route.fare?.base || 'N/A'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
            <p className="text-gray-600">Try adjusting your search</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Routes;

