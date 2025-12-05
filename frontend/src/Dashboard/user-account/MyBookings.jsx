import React, { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config.js";
import { formateDate } from "../../utils/formatDate.js";
import Loading from "../../components/Loader/Loading.jsx";
import Error from "../../components/Error/Error.jsx";

const MyBookings = () => {
  const {
    data: appointments,
    error,
    loading,
  } = useFetchData(`${BASE_URL}/users/appointments/my-appointments`);
  
  const [activeTab, setActiveTab] = useState("active");

  // Filter appointments based on status
  const activeAppointments = appointments?.filter(apt => 
    apt.status !== 'completed' && apt.status !== 'cancelled'
  ) || [];
  
  const completedAppointments = appointments?.filter(apt => 
    apt.status === 'completed'
  ) || [];
  
  const cancelledAppointments = appointments?.filter(apt => 
    apt.status === 'cancelled'
  ) || [];

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            <img 
              src={appointment.doctorPhoto || "/default-doctor.png"} 
              alt={appointment.doctorName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dr. {appointment.doctorName}
            </h3>
            <p className="text-sm text-gray-600">
              {appointment.doctorSpecialization}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {appointment.status || "Pending"}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Service:</span>
          <span className="font-medium">{appointment.testName || "General Consultation"}</span>
        </div>
        <div className="flex justify-between">
          <span>Price:</span>
          <span className="font-medium">${appointment.price || "100"}</span>
        </div>
        <div className="flex justify-between">
          <span>Booked on:</span>
          <span>{appointment.bookedOn || (appointment.createdAt ? formateDate(appointment.createdAt) : "Not specified")}</span>
        </div>
        {appointment.appointmentDate && (
          <div className="flex justify-between">
            <span>Appointment Date:</span>
            <span className="font-medium">
              {new Date(appointment.appointmentDate).toLocaleDateString()}
              {appointment.appointmentTime && ` at ${appointment.appointmentTime}`}
            </span>
          </div>
        )}
      </div>
      
      {/* Doctor's Messages Section */}
      {(appointment.notes || appointment.prescription) && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1">
            📋 Doctor's Messages
          </h4>
          
          {appointment.notes && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-blue-600 text-lg">💬</span>
                </div>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-blue-900">Doctor's Notes:</h5>
                  <p className="text-sm text-blue-800 mt-1">{appointment.notes}</p>
                </div>
              </div>
            </div>
          )}
          
          {appointment.prescription && (
            <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-r-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-green-600 text-lg">💊</span>
                </div>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-green-900">Prescription:</h5>
                  <p className="text-sm text-green-800 mt-1">{appointment.prescription}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Status-based Messages */}
      {appointment.status === 'confirmed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <span className="text-green-600 text-lg mr-2">✅</span>
            <div>
              <p className="text-sm font-medium text-green-800">Appointment Confirmed</p>
              <p className="text-xs text-green-700">
                Your appointment has been confirmed by the doctor. Please arrive on time.
                {appointment.appointmentDate && appointment.appointmentTime && (
                  <span className="block mt-1">
                    📅 {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {appointment.status === 'cancelled' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <span className="text-red-600 text-lg mr-2">❌</span>
            <div>
              <p className="text-sm font-medium text-red-800">Appointment Cancelled</p>
              <p className="text-xs text-red-700">
                This appointment has been cancelled. Please contact the doctor for rescheduling.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {appointment.status === 'completed' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <span className="text-blue-600 text-lg mr-2">✅</span>
            <div>
              <p className="text-sm font-medium text-blue-800">Consultation Completed</p>
              <p className="text-xs text-blue-700">
                Your consultation is complete. {(appointment.notes || appointment.prescription) ? 
                  'Check the doctor\'s messages above for important information.' : 
                  'The doctor has marked this consultation as complete.'}
              </p>
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <span className="mr-1">📧</span>
                Completion email sent to your registered email address
              </p>
            </div>
          </div>
        </div>
      )}
      
      {appointment.status === 'pending' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <span className="text-yellow-600 text-lg mr-2">⏳</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">Awaiting Doctor Response</p>
              <p className="text-xs text-yellow-700">
                Your appointment request is pending. The doctor will review and confirm shortly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {loading && !error && <Loading />}
      {error && !loading && <Error errMessage={error} />}
      {!loading && !error && (
        <div>
          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("active")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "active"
                    ? "border-primaryColor text-primaryColor"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Active Appointments ({activeAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "completed"
                    ? "border-primaryColor text-primaryColor"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Completed ({completedAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab("cancelled")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "cancelled"
                    ? "border-primaryColor text-primaryColor"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Cancelled ({cancelledAppointments.length})
              </button>
            </nav>
          </div>

          {/* Appointment Lists */}
          {activeTab === "active" && (
            <div>
              {activeAppointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Appointments</h3>
                  <p className="text-gray-500">
                    You don't have any active appointments at the moment.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div>
              {completedAppointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {completedAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Appointments</h3>
                  <p className="text-gray-500">
                    Your completed appointments will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "cancelled" && (
            <div>
              {cancelledAppointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {cancelledAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">❌</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Cancelled Appointments</h3>
                  <p className="text-gray-500">
                    Your cancelled appointments will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {!loading && !error && appointments?.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🏥</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Appointments Yet
          </h2>
          <p className="text-gray-500">
            You haven't booked any appointments with doctors yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
