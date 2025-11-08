import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Settings, Bell, Shield, Database } from 'lucide-react';

const AdminSettings = () => {
  return (
    <>
      <Helmet>
        <title>Settings - Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-gray-600">Manage system configuration and preferences</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">General Settings</h2>
            </div>
            <p className="text-gray-600">Configure general system settings</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Notification Settings</h2>
            </div>
            <p className="text-gray-600">Manage notification preferences</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">Security Settings</h2>
            </div>
            <p className="text-gray-600">Configure security and access controls</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-orange-100 rounded-full p-3">
                <Database className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold">Database Settings</h2>
            </div>
            <p className="text-gray-600">Manage database configuration</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;

