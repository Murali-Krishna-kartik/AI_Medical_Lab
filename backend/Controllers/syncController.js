/**
 * Sync Controller - Handle syncing between Booking and Appointment systems
 */
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";

// Sync existing bookings to doctor appointments
export const syncBookingsToAppointments = async (req, res) => {
  try {
    console.log("🔄 Starting comprehensive sync of bookings to appointments...");
    
    // Get all bookings with populated doctor and user data
    const bookings = await Booking.find({}).populate('doctor').populate('user');
    console.log(`📊 Found ${bookings.length} total bookings to process`);
    
    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const syncResults = [];

    for (const booking of bookings) {
      try {
        if (!booking.doctor || !booking.user) {
          console.log(`⚠️ Skipping booking ${booking._id} - missing doctor or user`);
          errorCount++;
          syncResults.push({
            bookingId: booking._id,
            status: 'error',
            reason: 'Missing doctor or user data'
          });
          continue;
        }

        // Check if appointment already exists for this booking
        const existingAppointment = booking.doctor.appointments.find(
          apt => (apt.stripeSessionId && apt.stripeSessionId === booking.session) ||
                 (apt.bookingId && apt.bookingId.toString() === booking._id.toString()) ||
                 (apt.notes && apt.notes.includes(booking.session))
        );

        if (existingAppointment) {
          console.log(`✅ Appointment already exists for booking ${booking._id}`);
          skippedCount++;
          syncResults.push({
            bookingId: booking._id,
            status: 'skipped',
            reason: 'Appointment already exists'
          });
          continue;
        }

        // Create comprehensive appointment from booking
        const appointment = {
          bookingId: booking._id,
          patientId: booking.user._id,
          patientName: booking.user.name || "Unknown Patient",
          patientEmail: booking.user.email || "",
          patientPhone: booking.user.phone || "",
          patientGender: booking.user.gender || "other",
          payment: booking.isPaid ? "completed" : "pending",
          price: booking.ticketPrice?.toString() || "0",
          bookedOn: booking.createdAt ? booking.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          testName: "Medical Consultation",
          status: booking.isPaid ? "confirmed" : "pending",
          appointmentDate: booking.createdAt || new Date(),
          appointmentTime: "To be scheduled",
          stripeSessionId: booking.session,
          notes: `Synced from existing booking. Patient: ${booking.user.name}. Session: ${booking.session}`,
        };

        booking.doctor.appointments.push(appointment);
        await booking.doctor.save();
        
        syncedCount++;
        syncResults.push({
          bookingId: booking._id,
          appointmentId: booking.doctor.appointments[booking.doctor.appointments.length - 1]._id,
          status: 'synced',
          patientName: booking.user.name,
          doctorName: booking.doctor.name
        });
        
        console.log(`✅ Synced booking ${booking._id} to doctor ${booking.doctor.name} for patient ${booking.user.name}`);
        
      } catch (error) {
        console.error(`❌ Error syncing booking ${booking._id}:`, error.message);
        errorCount++;
        syncResults.push({
          bookingId: booking._id,
          status: 'error',
          reason: error.message
        });
      }
    }

    console.log(`🎉 Sync completed: ${syncedCount} synced, ${skippedCount} skipped, ${errorCount} errors`);
    
    res.status(200).json({
      success: true,
      message: "Comprehensive booking sync completed",
      data: {
        totalBookings: bookings.length,
        syncedCount,
        skippedCount,
        errorCount,
        results: syncResults
      }
    });
  } catch (error) {
    console.error("💥 Sync error:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing bookings to appointments",
      error: error.message
    });
  }
};

// Update appointment status when payment is confirmed
export const updateAppointmentOnPayment = async (bookingId, isPaid) => {
  try {
    const booking = await Booking.findById(bookingId).populate('doctor').populate('user');
    if (!booking || !booking.doctor) {
      console.log(`⚠️ Booking ${bookingId} not found or missing doctor`);
      return false;
    }

    // Find the appointment in doctor's appointments array
    const appointment = booking.doctor.appointments.find(
      apt => (apt.stripeSessionId && apt.stripeSessionId === booking.session) ||
             (apt.bookingId && apt.bookingId.toString() === bookingId) ||
             (apt.notes && apt.notes.includes(booking.session))
    );

    if (appointment) {
      appointment.payment = isPaid ? "completed" : "failed";
      appointment.status = isPaid ? "confirmed" : "cancelled";
      appointment.notes = `${appointment.notes} - Payment ${isPaid ? 'completed' : 'failed'} on ${new Date().toISOString()}`;
      await booking.doctor.save();
      console.log(`✅ Updated appointment status for booking ${bookingId}`);
      return true;
    } else {
      console.log(`⚠️ No matching appointment found for booking ${bookingId}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating appointment for booking ${bookingId}:`, error);
    return false;
  }
};

// Get comprehensive appointment statistics for admin
export const getAppointmentStats = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('appointments name specialization');
    const bookings = await Booking.find({}).populate('doctor', 'name').populate('user', 'name');
    
    let totalAppointments = 0;
    let pendingAppointments = 0;
    let confirmedAppointments = 0;
    let completedAppointments = 0;
    let cancelledAppointments = 0;
    let paidAppointments = 0;
    let pendingPayments = 0;
    let failedPayments = 0;
    let totalRevenue = 0;
    let pendingRevenue = 0;

    doctors.forEach(doctor => {
      if (doctor.appointments) {
        totalAppointments += doctor.appointments.length;
        pendingAppointments += doctor.appointments.filter(apt => apt.status === 'pending').length;
        confirmedAppointments += doctor.appointments.filter(apt => apt.status === 'confirmed').length;
        completedAppointments += doctor.appointments.filter(apt => apt.status === 'completed').length;
        cancelledAppointments += doctor.appointments.filter(apt => apt.status === 'cancelled').length;
        
        paidAppointments += doctor.appointments.filter(apt => apt.payment === 'completed').length;
        pendingPayments += doctor.appointments.filter(apt => apt.payment === 'pending').length;
        failedPayments += doctor.appointments.filter(apt => apt.payment === 'failed').length;
        
        totalRevenue += doctor.appointments
          .filter(apt => apt.payment === 'completed')
          .reduce((sum, apt) => sum + (parseFloat(apt.price) || 0), 0);
        
        pendingRevenue += doctor.appointments
          .filter(apt => apt.payment === 'pending')
          .reduce((sum, apt) => sum + (parseFloat(apt.price) || 0), 0);
      }
    });

    // Calculate booking statistics
    const totalBookings = bookings.length;
    const paidBookings = bookings.filter(b => b.isPaid).length;
    const pendingBookings = bookings.filter(b => !b.isPaid).length;

    res.status(200).json({
      success: true,
      message: "Comprehensive appointment statistics retrieved",
      data: {
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
        },
        payments: {
          paid: paidAppointments,
          pending: pendingPayments,
          failed: failedPayments,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          pendingRevenue: Math.round(pendingRevenue * 100) / 100,
        },
        bookings: {
          total: totalBookings,
          paid: paidBookings,
          pending: pendingBookings,
        },
        doctors: {
          total: doctors.length,
          withAppointments: doctors.filter(d => d.appointments && d.appointments.length > 0).length,
        },
        systemHealth: {
          appointmentToBookingRatio: totalBookings > 0 ? Math.round((totalAppointments / totalBookings) * 100) : 0,
          averageAppointmentsPerDoctor: doctors.length > 0 ? Math.round(totalAppointments / doctors.length * 100) / 100 : 0,
        }
      }
    });
  } catch (error) {
    console.error("Error getting appointment stats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving appointment statistics",
      error: error.message
    });
  }
};

// Clean up duplicate appointments
export const cleanupDuplicateAppointments = async (req, res) => {
  try {
    console.log("🧹 Starting cleanup of duplicate appointments...");
    
    const doctors = await Doctor.find({}).select('appointments name');
    let cleanedCount = 0;
    let totalRemoved = 0;

    for (const doctor of doctors) {
      if (!doctor.appointments || doctor.appointments.length === 0) continue;

      const uniqueAppointments = [];
      const seenSessions = new Set();
      const seenBookingIds = new Set();
      let removedFromDoctor = 0;

      doctor.appointments.forEach(apt => {
        const sessionId = apt.stripeSessionId;
        const bookingId = apt.bookingId?.toString();
        
        // Keep appointment if it's unique by session ID or booking ID
        if (sessionId && !seenSessions.has(sessionId)) {
          seenSessions.add(sessionId);
          uniqueAppointments.push(apt);
        } else if (bookingId && !seenBookingIds.has(bookingId)) {
          seenBookingIds.add(bookingId);
          uniqueAppointments.push(apt);
        } else if (!sessionId && !bookingId) {
          // Keep appointments without session/booking IDs (manually created)
          uniqueAppointments.push(apt);
        } else {
          removedFromDoctor++;
        }
      });

      if (removedFromDoctor > 0) {
        doctor.appointments = uniqueAppointments;
        await doctor.save();
        cleanedCount++;
        totalRemoved += removedFromDoctor;
        console.log(`🧹 Cleaned ${removedFromDoctor} duplicates from Dr. ${doctor.name}`);
      }
    }

    console.log(`✅ Cleanup completed: ${totalRemoved} duplicates removed from ${cleanedCount} doctors`);

    res.status(200).json({
      success: true,
      message: "Duplicate appointment cleanup completed",
      data: {
        doctorsCleaned: cleanedCount,
        totalAppointmentsRemoved: totalRemoved,
      }
    });
  } catch (error) {
    console.error("💥 Cleanup error:", error);
    res.status(500).json({
      success: false,
      message: "Error cleaning up duplicate appointments",
      error: error.message
    });
  }
};