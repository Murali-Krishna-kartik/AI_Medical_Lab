import { useState, useEffect } from "react";
import convertTime from "../../utils/convertTime.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { BASE_URL } from "./../../config.js";
import { toast } from "react-toastify";
import { getToken } from "../../utils/tokenManager.js";

const SidePanel = ({ doctorId, ticketPrice, timeSlots }) => {
  const { user, role, isAuthenticated } = useAuth();
  const [currentDoctorId, setCurrentDoctorId] = useState(null);

  // Get current user's doctor ID if they are a doctor
  useEffect(() => {
    const fetchCurrentDoctorId = async () => {
      if (role === 'doctor' && isAuthenticated) {
        try {
          const token = getToken();
          
          if (!token) return;
          
          const res = await fetch(`${BASE_URL}/doctors/profile/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (res.ok) {
            setCurrentDoctorId(data.data._id);
          }
        } catch (err) {
          console.error("Error fetching doctor profile:", err);
        }
      }
    };

    fetchCurrentDoctorId();
  }, [role, isAuthenticated]);

  const bookingHandler = async () => {
    // Frontend validation before API call
    if (role === 'doctor') {
      if (currentDoctorId === doctorId) {
        toast.error("You cannot book an appointment with yourself!");
        return;
      }
      toast.error("Doctors cannot book appointments through the patient system. Please contact the doctor directly for professional consultation.");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to book an appointment");
      return;
    }

    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }
      
      const res = await fetch(
        `${BASE_URL}/bookings/checkout-session/${doctorId}`,
        {
          method: "post",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      if (data.session.url) {
        window.location.href = data.session.url;
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Check if current user is the same doctor
  const isSameDoctor = role === 'doctor' && currentDoctorId === doctorId;
  const isDoctor = role === 'doctor';

  return (
    <div className="shadow-panelShadow p-3 rounded-md">
      <div className="flex items-center justify-between">
        <p className="text__para mt-0 font-semibold">Ticket Price</p>
        <span className="text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold">
          {ticketPrice} USD
        </span>
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">
          Available Time Slots:
        </p>

        <ul className="mt-3">
          {timeSlots?.map((item, index) => (
            <li key={index} className="flex items-center justify-between mb-2">
              <p className="text-[15px] leading-6 text-textColor font-semibold">
                {item.day.charAt(0).toUpperCase() + item.day.slice(1)}
              </p>
              <p className="text-[15px] leading-6 text-textColor font-semibold">
                {convertTime(item.startingTime)} -{" "}
                {convertTime(item.endingTime)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Conditional rendering based on user role and doctor status */}
      {!isAuthenticated ? (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3 text-center">
            Please login to book an appointment
          </p>
          <button 
            disabled 
            className="btn px-2 w-full rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Login Required
          </button>
        </div>
      ) : isSameDoctor ? (
        <div className="mt-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>This is your profile.</strong> You cannot book an appointment with yourself.
                </p>
              </div>
            </div>
          </div>
          <button 
            disabled 
            className="btn px-2 w-full rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Cannot Book With Yourself
          </button>
        </div>
      ) : isDoctor ? (
        <div className="mt-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Professional Consultation:</strong> As a doctor, please contact this colleague directly for professional consultation.
                </p>
              </div>
            </div>
          </div>
          <button 
            disabled 
            className="btn px-2 w-full rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Contact Directly
          </button>
        </div>
      ) : (
        <button onClick={bookingHandler} className="btn px-2 w-full rounded-md">
          Book Appointment
        </button>
      )}
    </div>
  );
};

export default SidePanel;
