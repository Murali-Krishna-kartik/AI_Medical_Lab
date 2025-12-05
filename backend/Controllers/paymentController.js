import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";

// Manual payment update for testing (admin only)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId, isPaid } = req.body;

    console.log(`🔄 Updating payment status for booking ${bookingId} to ${isPaid ? 'paid' : 'unpaid'}`);

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('doctor');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Update booking payment status
    booking.isPaid = isPaid;
    booking.status = isPaid ? "approved" : "pending";
    await booking.save();

    // Update appointment in doctor's appointments array
    const doctor = booking.doctor;
    if (doctor && doctor.appointments) {
      const appointment = doctor.appointments.find(apt => 
        apt.stripeSessionId === booking.session || 
        apt.bookingId?.toString() === booking._id.toString()
      );

      if (appointment) {
        appointment.payment = isPaid ? "completed" : "pending";
        appointment.status = isPaid ? "confirmed" : "pending";
        appointment.notes = `Payment ${isPaid ? 'completed' : 'pending'}. Updated manually.`;
        await doctor.save();
        console.log("✅ Appointment payment status updated");
      }
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${isPaid ? 'paid' : 'unpaid'}`,
      data: {
        bookingId: booking._id,
        isPaid: booking.isPaid,
        status: booking.status
      }
    });

  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message
    });
  }
};

// Get all bookings with payment status (admin only)
export const getAllBookingsWithPaymentStatus = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('doctor', 'name specialization')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const bookingsWithStatus = bookings.map(booking => ({
      _id: booking._id,
      session: booking.session,
      doctorName: booking.doctor?.name || 'Unknown',
      patientName: booking.user?.name || 'Unknown',
      ticketPrice: booking.ticketPrice,
      isPaid: booking.isPaid,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookingsWithStatus,
      summary: {
        total: bookings.length,
        paid: bookings.filter(b => b.isPaid).length,
        pending: bookings.filter(b => !b.isPaid).length,
        totalRevenue: bookings
          .filter(b => b.isPaid)
          .reduce((sum, b) => sum + (parseFloat(b.ticketPrice) || 0), 0)
      }
    });

  } catch (error) {
    console.error("Error getting bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving bookings",
      error: error.message
    });
  }
};

// Simulate successful payment (for testing)
export const simulatePaymentSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    console.log(`🧪 Simulating payment success for session: ${sessionId}`);

    // Find booking by session ID
    const booking = await Booking.findOne({ session: sessionId }).populate('doctor');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for session ID"
      });
    }

    // Update booking
    booking.isPaid = true;
    booking.status = "approved";
    await booking.save();

    // Update appointment
    const doctor = booking.doctor;
    if (doctor && doctor.appointments) {
      const appointment = doctor.appointments.find(apt => 
        apt.stripeSessionId === sessionId || 
        apt.bookingId?.toString() === booking._id.toString()
      );

      if (appointment) {
        appointment.payment = "completed";
        appointment.status = "confirmed";
        appointment.notes = `Payment completed (simulated). ${appointment.notes}`;
        await doctor.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment success simulated",
      data: {
        bookingId: booking._id,
        sessionId: sessionId,
        isPaid: booking.isPaid,
        status: booking.status
      }
    });

  } catch (error) {
    console.error("Error simulating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error simulating payment",
      error: error.message
    });
  }
};