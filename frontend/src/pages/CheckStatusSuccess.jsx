import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const CheckStatusSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    console.log("🔍 CheckStatusSuccess loaded");
    console.log("🔍 Current URL:", window.location.href);
    console.log("🔍 URL Search Params:", window.location.search);
    console.log("🔍 Session ID from params:", sessionId);
    
    if (sessionId) {
      console.log("✅ Session ID found:", sessionId);
      toast.success("Payment successful! Appointment booked successfully.");
      setIsLoading(false);

      // Start countdown and redirect after 5 seconds
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate("/users/profile/me");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else {
      console.log("❌ No session ID found, redirecting to home");
      toast.error("Invalid payment session - no session ID found");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [sessionId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          
          <p className="text-gray-600 mb-8">
            Your payment has been processed successfully and your appointment has been booked.
          </p>

          {/* Payment Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Confirmed</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">✅ Booked Successfully</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium text-green-600">✅ Paid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">Medical Consultation</span>
              </div>
            </div>
          </div>

          {/* Auto-redirect message */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <svg
                className="h-5 w-5 text-blue-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium">
                  Redirecting to your profile in {countdown} seconds...
                </p>
              </div>
            </div>
          </div>

          {/* Manual navigation buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/users/profile/me")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Go to Profile Now
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckStatusSuccess;