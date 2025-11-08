import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Bus, Target, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - College Transport Management System</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
              About Our System
            </h1>
            
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <p className="text-lg text-gray-700 mb-6">
                The College Transport Management System is a comprehensive solution designed to 
                streamline and optimize transportation services for educational institutions. 
                Our platform provides a seamless experience for students, staff, drivers, and 
                administrators.
              </p>
              <p className="text-lg text-gray-700">
                We are committed to providing reliable, efficient, and user-friendly transportation 
                management that enhances the daily commute experience for everyone in the college community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <Target className="h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
                <p className="text-gray-700">
                  To provide a reliable, efficient, and user-friendly transportation management 
                  system that enhances the daily commute experience for students and staff.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <Award className="h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
                <p className="text-gray-700">
                  To become the leading transport management solution for educational institutions, 
                  setting new standards in efficiency and user experience.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-6 text-center">Key Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <Bus className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Bus Management</h3>
                    <p className="text-gray-600 text-sm">
                      Complete fleet management with real-time tracking and status updates.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Users className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">User Management</h3>
                    <p className="text-gray-600 text-sm">
                      Role-based access control for students, staff, drivers, and administrators.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;

