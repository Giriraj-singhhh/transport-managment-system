import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { routesAPI } from '../../services/api';
import { Navigation, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminRoutes = () => {
  const { data, isLoading, error } = useQuery(
    'adminRoutes', 
    async () => {
      const response = await routesAPI.getRoutes();
      // axios response structure: response.data = { status: 'success', data: { routes: [...], pagination: {...} } }
      return response.data;
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      retry: 1
    }
  );

  // Extract routes from the nested data structure
  const routes = data?.data?.routes || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading routes: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Routes - Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Routes</h1>
            <p className="mt-2 text-gray-600">View and manage all routes</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add Route</span>
          </button>
        </div>

        {routes.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {routes.map((route) => (
              <div key={route._id} className="bg-white rounded-lg shadow p-6">
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
                <p className="text-gray-600 mb-4">
                  {route.startLocation} → {route.endLocation}
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Distance: {route.distance} km</p>
                  <p>Estimated Time: {route.estimatedTime} minutes</p>
                  <p>Fare: ₹{route.fare?.base || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminRoutes;

