import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Home, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <>
      <Helmet>
        <title>403 - Unauthorized Access</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">Unauthorized Access</h2>
          <p className="text-gray-600 mt-2 mb-8 max-w-md mx-auto">
            You don't have permission to access this page. Please contact an administrator if you
            believe this is an error.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Go to Dashboard</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;

