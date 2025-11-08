import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { busesAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { MapPin, Bus, Navigation } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const LiveTracking = () => {
  const [selectedBus, setSelectedBus] = useState(null);
  const { socket, isConnected } = useSocket();

  const { data, isLoading } = useQuery('buses', () => busesAPI.getBuses());

  const buses = data?.data?.buses?.filter(bus => bus.status === 'active') || [];

  useEffect(() => {
    if (socket && selectedBus) {
      socket.on('bus-location-update', (data) => {
        if (data.busId === selectedBus._id) {
          // Update bus location in real-time
          console.log('Location update:', data);
        }
      });

      return () => {
        socket.off('bus-location-update');
      };
    }
  }, [socket, selectedBus]);

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
        <title>Live Tracking - College Transport Management System</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Bus Tracking</h1>
          <p className="mt-2 text-gray-600">Track buses in real-time</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bus List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Active Buses</h2>
              <div className="space-y-2">
                {buses.map((bus) => (
                  <button
                    key={bus._id}
                    onClick={() => setSelectedBus(bus)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedBus?._id === bus._id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Bus className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{bus.name}</p>
                        <p className="text-sm text-gray-600">#{bus.busNumber}</p>
                        {bus.location?.isOnline && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Online
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              {selectedBus ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      {selectedBus.name} - #{selectedBus.busNumber}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {isConnected ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          Live
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                          Offline
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Map placeholder - In a real app, you would integrate with Google Maps or Mapbox */}
                  <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Map Integration</p>
                      <p className="text-sm text-gray-500">
                        {selectedBus.location?.currentLat && selectedBus.location?.currentLng
                          ? `Location: ${selectedBus.location.currentLat}, ${selectedBus.location.currentLng}`
                          : 'Location data not available'}
                      </p>
                      {selectedBus.location?.lastUpdated && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last updated: {new Date(selectedBus.location.lastUpdated).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedBus.routeId && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Route Information</h3>
                      <p className="text-sm text-gray-600">
                        {selectedBus.routeId.name || 'Route assigned'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a bus to track</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveTracking;

