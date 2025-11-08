import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { busesAPI } from '../../services/api';
import { MapPin, Navigation, Save } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const DriverLocation = () => {
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const queryClient = useQueryClient();

  const { data: buses, isLoading } = useQuery('driverBuses', () => busesAPI.getBuses());

  const updateLocationMutation = useMutation(
    ({ busId, location }) => busesAPI.updateBusLocation(busId, location),
    {
      onSuccess: () => {
        toast.success('Location updated successfully');
        queryClient.invalidateQueries('driverBuses');
        setLocation({ lat: '', lng: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update location');
      },
    }
  );

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast.error('Failed to get location: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const busId = e.target.busId.value;
    if (!busId) {
      toast.error('Please select a bus');
      return;
    }
    if (!location.lat || !location.lng) {
      toast.error('Please enter or get your location');
      return;
    }
    updateLocationMutation.mutate({
      busId,
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const driverBuses = buses?.data?.buses || [];

  return (
    <>
      <Helmet>
        <title>Update Location - Driver Dashboard</title>
      </Helmet>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Update Bus Location</h1>
          <p className="mt-2 text-gray-600">Update your current bus location</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bus
              </label>
              <select
                name="busId"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a bus</option>
                {driverBuses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.name} - #{bus.busNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Coordinates
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={location.lat}
                    onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={location.lng}
                    onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="mt-2 flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Navigation className="h-4 w-4" />
                <span>Get Current Location</span>
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Location Preview</p>
                  {location.lat && location.lng ? (
                    <p className="text-sm text-blue-700 mt-1">
                      {location.lat}, {location.lng}
                    </p>
                  ) : (
                    <p className="text-sm text-blue-700 mt-1">
                      Enter coordinates or use "Get Current Location"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateLocationMutation.isLoading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>
                {updateLocationMutation.isLoading ? 'Updating...' : 'Update Location'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DriverLocation;

