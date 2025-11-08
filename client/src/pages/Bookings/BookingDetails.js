import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { bookingsAPI } from '../../services/api';
import { ArrowLeft, Calendar, Bus, MapPin, User, Phone, Mail, X } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['booking', id],
    () => bookingsAPI.getBooking(id),
    { enabled: !!id }
  );

  const cancelMutation = useMutation(
    (reason) => bookingsAPI.cancelBooking(id, reason),
    {
      onSuccess: () => {
        toast.success('Booking cancelled successfully');
        queryClient.invalidateQueries(['booking', id]);
        queryClient.invalidateQueries('userBookings');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to cancel booking');
      },
    }
  );

  const booking = data?.data?.booking;

  const handleCancel = () => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      cancelMutation.mutate(reason);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Booking not found</p>
        <Link to="/app/bookings" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Booking Details - College Transport Management System</title>
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
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600">Ticket #{booking.ticketNumber || booking._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status.toUpperCase()}
            </span>
            {booking.status === 'confirmed' && booking.canBeCancelled && (
              <button
                onClick={handleCancel}
                disabled={cancelMutation.isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>Cancel Booking</span>
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Travel Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Travel Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(booking.travelDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Bus className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Bus</p>
                      <p className="font-medium text-gray-900">
                        {booking.busId?.name || 'N/A'} ({booking.busId?.busNumber || ''})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Seat Number</p>
                      <p className="font-medium text-gray-900">Seat {booking.seatNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {booking.boardingPoint && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Boarding Point</h3>
                  <p className="font-medium text-gray-900">{booking.boardingPoint.name}</p>
                  <p className="text-sm text-gray-600">{booking.boardingPoint.time}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Passenger Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">
                        {booking.passengerDetails?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {booking.passengerDetails?.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                          {booking.passengerDetails.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {booking.passengerDetails?.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">
                          {booking.passengerDetails.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-gray-900">₹{booking.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="font-semibold capitalize text-gray-900">
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold capitalize text-gray-900">
                      {booking.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {booking.cancellation?.reason && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="text-sm font-medium text-red-800 mb-2">Cancellation Details</h3>
              <p className="text-sm text-red-700">{booking.cancellation.reason}</p>
              {booking.cancellation.refundAmount > 0 && (
                <p className="text-sm text-red-700 mt-2">
                  Refund Amount: ₹{booking.cancellation.refundAmount}
                </p>
              )}
            </div>
          )}

          {booking.specialRequests && booking.specialRequests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Special Requests</h3>
              <ul className="list-disc list-inside space-y-1">
                {booking.specialRequests.map((request, index) => (
                  <li key={index} className="text-gray-700">{request}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingDetails;

