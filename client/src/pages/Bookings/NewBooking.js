import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { schedulesAPI, busesAPI, bookingsAPI } from '../../services/api';
import { ArrowLeft, Calendar, Bus, MapPin, User } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const NewBooking = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    scheduleId: '',
    busId: '',
    travelDate: '',
    seatNumber: null,
    passengerDetails: {
      name: '',
      phone: '',
      email: '',
    },
  });

  const { data: schedules } = useQuery('schedules', () => schedulesAPI.getSchedules());
  const { data: availableSeats, isLoading: seatsLoading } = useQuery(
    ['availableSeats', formData.busId, formData.travelDate],
    () => busesAPI.getAvailableSeats(formData.busId, formData.travelDate),
    { enabled: !!formData.busId && !!formData.travelDate }
  );

  const bookingMutation = useMutation(
    (data) => bookingsAPI.createBooking(data),
    {
      onSuccess: (response) => {
        toast.success('Booking created successfully!');
        queryClient.invalidateQueries('userBookings');
        navigate(`/app/bookings/${response.data.booking._id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      },
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('passengerDetails.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        passengerDetails: {
          ...formData.passengerDetails,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleScheduleSelect = (schedule) => {
    setFormData({
      ...formData,
      scheduleId: schedule._id,
      busId: schedule.busId?._id || schedule.busId,
    });
    setStep(2);
  };

  const handleSeatSelect = (seatNumber) => {
    setFormData({
      ...formData,
      seatNumber,
    });
    setStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    bookingMutation.mutate(formData);
  };

  const selectedSchedule = schedules?.data?.schedules?.find(
    (s) => s._id === formData.scheduleId
  );

  return (
    <>
      <Helmet>
        <title>New Booking - College Transport Management System</title>
      </Helmet>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/app/bookings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Booking</h1>
            <p className="text-gray-600">Book your seat in a few simple steps</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Select Schedule</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Select Seat</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Confirm</span>
            </div>
          </div>

          {/* Step 1: Select Schedule */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select a Schedule</h2>
              <div className="space-y-4">
                {schedules?.data?.schedules?.map((schedule) => (
                  <button
                    key={schedule._id}
                    onClick={() => handleScheduleSelect(schedule)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {schedule.routeId?.name || 'Route'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {schedule.departureTime} - {schedule.arrivalTime}
                        </p>
                        <p className="text-sm text-gray-600">
                          {schedule.busId?.name || 'Bus'} • Seat {schedule.capacity} available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{schedule.fare}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Seat */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Select Your Seat</h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Change Schedule
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Date
                </label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {formData.travelDate && (
                <div>
                  {seatsLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: selectedSchedule?.busId?.capacity || 40 }, (_, i) => {
                        const seatNum = i + 1;
                        const isAvailable = availableSeats?.data?.availableSeats?.includes(seatNum);
                        const isSelected = formData.seatNumber === seatNum;
                        return (
                          <button
                            key={seatNum}
                            onClick={() => isAvailable && handleSeatSelect(seatNum)}
                            disabled={!isAvailable}
                            className={`p-3 rounded-lg text-sm font-medium ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : isAvailable
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {seatNum}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm Booking */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Confirm Booking</h2>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Change Seat
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">Schedule</p>
                <p className="font-semibold">{selectedSchedule?.routeId?.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedSchedule?.departureTime} - {selectedSchedule?.arrivalTime}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">Travel Date</p>
                <p className="font-semibold">
                  {new Date(formData.travelDate).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">Seat Number</p>
                <p className="font-semibold">Seat {formData.seatNumber}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">Fare</p>
                <p className="font-semibold text-xl">₹{selectedSchedule?.fare}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Passenger Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="passengerDetails.name"
                    value={formData.passengerDetails.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="passengerDetails.phone"
                    value={formData.passengerDetails.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="passengerDetails.email"
                    value={formData.passengerDetails.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={bookingMutation.isLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {bookingMutation.isLoading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default NewBooking;

