import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BsCheckCircle, BsCalendarCheck, BsArrowRight } from 'react-icons/bs';
import { FaUserMd } from 'react-icons/fa';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  // Auto redirect after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/users/profile/me';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BsCheckCircle className="text-4xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-100">
              Your appointment has been booked successfully
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUserMd className="text-2xl text-primaryColor" />
              </div>
              <h2 className="text-xl font-semibold text-headingColor mb-2">
                Appointment Confirmed
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your payment has been processed and your appointment request has been sent to the doctor. 
                You can check your appointment status in your profile.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <BsCalendarCheck className="text-blue-600" />
                What's Next?
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• The doctor will review your appointment request</li>
                <li>• Check your profile for appointment status updates</li>
                <li>• The doctor will schedule a specific date and time</li>
                <li>• You'll be notified of any status changes in your dashboard</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/users/profile/me"
                className="w-full bg-primaryColor text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <BsCalendarCheck />
                View My Appointments
              </Link>
              
              <Link
                to="/doctors"
                className="w-full border-2 border-primaryColor text-primaryColor py-3 px-4 rounded-lg font-medium text-center hover:bg-primaryColor hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Browse More Doctors
                <BsArrowRight />
              </Link>
            </div>

            {/* Auto Redirect Notice */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Redirecting to your profile in {countdown} seconds...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="bg-primaryColor h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our{' '}
            <Link to="/contact" className="text-primaryColor hover:underline">
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;