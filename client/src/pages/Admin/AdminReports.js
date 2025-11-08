import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const AdminReports = () => {
  return (
    <>
      <Helmet>
        <title>Reports - Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">View system reports and analytics</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Booking Reports</h2>
            </div>
            <p className="text-gray-600">Generate and view booking reports</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Revenue Reports</h2>
            </div>
            <p className="text-gray-600">View revenue and financial reports</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">Bus Utilization</h2>
            </div>
            <p className="text-gray-600">Analyze bus usage and efficiency</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-orange-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold">Schedule Reports</h2>
            </div>
            <p className="text-gray-600">View schedule performance reports</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminReports;

