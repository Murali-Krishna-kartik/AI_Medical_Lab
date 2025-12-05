import React, { useState } from "react";
import { formateDate } from "../../utils/formatDate.js";
import { BASE_URL } from "../../config.js";
import { getToken } from "../../utils/tokenManager.js";
import { toast } from "react-toastify";

const Appointments = ({ appointments, onRefresh }) => {
  console.log("appointments: ", appointments);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    status: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
    prescription: ''
  });

  // Handle opening update modal
  const handleUpdateClick = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status || 'pending',
      appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
      appointmentTime: appointment.appointmentTime || '',
      notes: appointment.notes || '',
      prescription: appointment.prescription || ''
    });
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle appointment update
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation: If updating from pending to confirmed, time field is mandatory
      if (selectedAppointment.status === 'pending' && formData.status === 'confirmed') {
        if (!formData.appointmentTime || formData.appointmentTime.trim() === '') {
          throw new Error("Appointment time is required when confirming an appointment");
        }
        if (!formData.appointmentDate || formData.appointmentDate.trim() === '') {
          throw new Error("Appointment date is required when confirming an appointment");
        }
      }

      // Prepare update data - only include fields that should be updated
      const updateData = {
        status: formData.status,
        notes: formData.notes,
        prescription: formData.prescription
      };

      // Only include date/time for pending appointments
      if (selectedAppointment.status === 'pending') {
        if (formData.appointmentDate) {
          updateData.appointmentDate = formData.appointmentDate;
        }
        if (formData.appointmentTime) {
          updateData.appointmentTime = formData.appointmentTime;
        }
      }

      const token = getToken();
      
      if (!token) {
        throw new Error("No authentication token available");
      }
      
      console.log('🔍 FRONTEND: Sending appointment update request');
      console.log('🔍 FRONTEND: URL:', `${BASE_URL}/doctors/appointments/${selectedAppointment._id}`);
      console.log('🔍 FRONTEND: Update data:', updateData);
      console.log('🔍 FRONTEND: Token present:', !!token);
      
      const res = await fetch(`${BASE_URL}/doctors/appointments/${selectedAppointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('🔍 FRONTEND: Response status:', res.status);
      console.log('🔍 FRONTEND: Response ok:', res.ok);

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Appointment updated successfully!');
      setShowModal(false);
      
      // Use the refresh callback instead of page reload to stay on appointments page
      if (onRefresh) {
        console.log('✅ FRONTEND: Appointment updated successfully, refreshing appointments data');
        setTimeout(() => {
          onRefresh();
        }, 1000); // Small delay to let the toast show
      } else {
        console.log('✅ FRONTEND: Appointment updated successfully, staying on appointments page');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };



  // Handle appointment deletion
  const handleDeleteAppointment = async (appointmentId) => {
    if (!appointmentId) {
      toast.error('Invalid appointment ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      const token = getToken();
      
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      console.log('Deleting appointment:', appointmentId);

      const res = await fetch(`${BASE_URL}/doctors/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await res.json();
      console.log('Delete response:', result);

      if (!res.ok) {
        throw new Error(result.message || `HTTP error! status: ${res.status}`);
      }

      toast.success(result.message || 'Appointment deleted successfully!');
      
      // Refresh the appointments data instead of full page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Delete appointment error:', error);
      toast.error(error.message || 'Failed to delete appointment. Please try again.');
    }
  };
  
  // Handle empty appointments
  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
          <p className="text-gray-500">
            Patient appointment requests will appear here once they book consultations with you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Appointment Requests ({appointments.length})
        </h2>
        <p className="text-gray-600 text-sm">
          Manage your patient appointments and consultations
        </p>
      </div>
      <table className="w-full min-w-max bg-white border-gray-300 border rounded-md">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-xs leading-4 uppercase">
            <th className="py-3 px-6 text-left">Patient</th>
            <th className="py-3 px-6 text-left">Gender</th>
            <th className="py-3 px-6 text-left">Status</th>
            <th className="py-3 px-6 text-left">Price</th>
            <th className="py-3 px-6 text-left">Booked on</th>
            <th className="py-3 px-6 text-left">Service</th>
            <th className="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {appointments?.map((item) => (
            <tr
              key={item._id}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="py-3 px-6 text-left whitespace-nowrap">
                <div className="flex items-center">
                  <div className="mr-2">
                    <div className="text-sm font-semibold">
                      {item.patientName || item.user?.name || "Unknown Patient"}
                    </div>
                    {item.patientEmail && (
                      <div className="text-xs text-gray-500">
                        {item.patientEmail}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-6 text-left">
                {item.patientGender || item.user?.gender || "Not specified"}
              </td>
              <td className="py-3 px-6 text-left">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  item.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status || "Pending"}
                </span>
              </td>
              <td className="py-3 px-6 text-left font-semibold">
                ${item.price || item.ticketPrice || "0"}
              </td>
              <td className="py-3 px-6 text-left">
                {item.bookedOn || formateDate(item.updatedAt || item.createdAt)}
              </td>
              <td className="py-3 px-6 text-left">
                {item.testName || "Medical Consultation"}
              </td>
              <td className="py-3 px-6 text-left">
                <div className="flex space-x-2">
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    onClick={() => handleUpdateClick(item)}
                  >
                    Manage
                  </button>

                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    onClick={() => handleDeleteAppointment(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Appointment Management Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Appointment
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {selectedAppointment && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    <strong>Patient:</strong> {selectedAppointment.patientName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Service:</strong> {selectedAppointment.testName || "Medical Consultation"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Price:</strong> ${selectedAppointment.price}
                  </p>
                </div>
              )}

              <form onSubmit={handleUpdateAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date *
                    {((selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && formData.status === 'completed') && (
                      <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">🔒 Will be frozen</span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleInputChange}
                    disabled={(selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && formData.status === 'completed'}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && formData.status === 'completed'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : ''
                    }`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && formData.status === 'completed'
                      ? 'Date will be locked when marking as completed' 
                      : 'Only future dates are allowed for appointments'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Time
                    {(selectedAppointment?.status === 'pending' && formData.status === 'confirmed') && (
                      <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">* Required</span>
                    )}
                    {((selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && formData.status === 'completed') && (
                      <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">🔒 Will be frozen</span>
                    )}
                  </label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    disabled={(selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && formData.status === 'completed'}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && formData.status === 'completed'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
                        : (selectedAppointment?.status === 'pending' && formData.status === 'confirmed')
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    required={selectedAppointment?.status === 'pending' && formData.status === 'confirmed'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && formData.status === 'completed'
                      ? 'Time will be locked when marking as completed' 
                      : (selectedAppointment?.status === 'pending' && formData.status === 'confirmed')
                      ? 'Time must be specified when confirming an appointment'
                      : 'Set the appointment time (optional for pending status)'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about the appointment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prescription
                  </label>
                  <textarea
                    name="prescription"
                    value={formData.prescription}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add prescription details..."
                  />
                </div>

                {/* Email notification info */}
                {formData.status === 'completed' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">Email Notification</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          When you mark this appointment as "completed", the patient will automatically receive an email with:
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                          <li>Appointment completion confirmation</li>
                          <li>Prescription details (if provided)</li>
                          <li>Your notes and recommendations</li>
                          <li>Next steps and follow-up instructions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Appointment'}
                    {formData.status === 'completed' && (
                      <span className="ml-2">📧</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
