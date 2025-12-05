import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Stripe from "stripe";
import { sendAppointmentConfirmationEmail } from "../utils/emailService.js";

export const getCheckoutSession = async (req, res) => {
  try {
    console.log("🔍 Checkout session request:", {
      doctorId: req.params.doctorId,
      userId: req.userId,
      stripeKeyExists: !!process.env.STRIPE_SECRET_KEY,
      clientSiteUrl: process.env.CLIENT_SITE_URL
    });
    
    console.log("🌐 SUCCESS URL WILL BE:", `${process.env.CLIENT_SITE_URL}/checkstatus-success`);
    console.log("🔍 Raw CLIENT_SITE_URL from env:", process.env.CLIENT_SITE_URL);
    console.log("🔍 All env vars related to client:", {
      CLIENT_SITE_URL: process.env.CLIENT_SITE_URL,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    });

    //get currently booked doctor
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      console.log("❌ Doctor not found:", req.params.doctorId);
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      console.log("❌ User not found:", req.userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🚫 PREVENT DOCTORS FROM BOOKING APPOINTMENTS WITH THEMSELVES
    if (user.role === 'doctor' && doctor._id.toString() === req.userId) {
      console.log("❌ Doctor trying to book appointment with themselves:", {
        doctorId: doctor._id.toString(),
        userId: req.userId,
        doctorName: doctor.name
      });
      return res.status(400).json({ 
        success: false, 
        message: "Doctors cannot book appointments with themselves. Please contact another doctor for medical consultation." 
      });
    }

    // 🚫 ADDITIONAL CHECK: Prevent any doctor from booking with any doctor (optional - remove if doctors should be able to book with other doctors)
    if (user.role === 'doctor') {
      console.log("❌ Doctor trying to book appointment:", {
        doctorUserId: req.userId,
        targetDoctorId: doctor._id.toString(),
        doctorName: user.name
      });
      return res.status(400).json({ 
        success: false, 
        message: "Doctors cannot book appointments through the patient booking system. Please use the professional consultation system or contact the doctor directly." 
      });
    }

    console.log("✅ Found doctor and user:", {
      doctorName: doctor.name,
      userName: user.name,
      ticketPrice: doctor.ticketPrice,
      doctorBio: doctor.bio,
      doctorPhoto: doctor.photo
    });

    // Validate doctor has required fields
    if (!doctor.ticketPrice || doctor.ticketPrice <= 0) {
      console.log("❌ Invalid ticket price:", doctor.ticketPrice);
      return res.status(400).json({ 
        success: false, 
        message: "Doctor ticket price is not set or invalid" 
      });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_51234567890abcdef') {
      console.log("❌ Stripe key missing or placeholder");
      return res.status(500).json({ 
        success: false, 
        message: "Stripe configuration missing. Please add your Stripe secret key to .env file" 
      });
    }

    if (!process.env.CLIENT_SITE_URL) {
      console.log("❌ CLIENT_SITE_URL missing");
      return res.status(500).json({ 
        success: false, 
        message: "Client site URL not configured" 
      });
    }

    console.log("🔄 Creating Stripe session...");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sessionData = {
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:5174/checkstatus-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_SITE_URL}/doctors/${doctor.id}`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(doctor.ticketPrice * 100), // Ensure it's an integer
            product_data: {
              name: doctor.name || "Medical Consultation",
              description: doctor.bio || "Medical consultation with doctor",
              // Only include images if photo exists and is a valid URL
              ...(doctor.photo && doctor.photo.startsWith('http') ? { images: [doctor.photo] } : {})
            },
          },
          quantity: 1,
        },
      ],
    };

    console.log("📋 Stripe session data:", JSON.stringify(sessionData, null, 2));

    const session = await stripe.checkout.sessions.create(sessionData);
    console.log("✅ Stripe session created:", session.id);

    // Create booking record
    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      session: session.id,
      status: "pending",
      isPaid: false, // Will be updated by webhook
    });
    
    await booking.save();
    console.log("✅ Booking saved to database");

    // Create appointment in doctor's appointments array
    const appointment = {
      bookingId: booking._id, // Link to booking
      patientId: user._id, // Link to patient
      patientName: user.name || "Unknown Patient",
      patientEmail: user.email || "",
      patientPhone: user.phone || "",
      patientGender: user.gender || "other",
      payment: "pending",
      price: doctor.ticketPrice?.toString() || "0",
      bookedOn: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      testName: "Medical Consultation",
      status: "pending",
      appointmentDate: new Date(),
      appointmentTime: "To be scheduled",
      stripeSessionId: session.id,
      notes: `New appointment request from ${user.name}`,
    };
    
    doctor.appointments.push(appointment);
    await doctor.save();
    console.log("✅ Appointment added to doctor's appointments list");
    
    res.status(200).json({ 
      success: true, 
      message: "Successfully created checkout session", 
      session: {
        id: session.id,
        url: session.url
      }
    });
  } catch (err) {
    console.error("💥 Checkout session error:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      type: err.type
    });
    
    // More specific error messages
    let errorMessage = "Error creating checkout session";
    if (err.type === 'StripeCardError') {
      errorMessage = "Payment card error: " + err.message;
    } else if (err.type === 'StripeInvalidRequestError') {
      errorMessage = "Invalid payment request: " + err.message;
    } else if (err.type === 'StripeAPIError') {
      errorMessage = "Payment service error: " + err.message;
    } else if (err.name === 'ValidationError') {
      errorMessage = "Data validation error: " + err.message;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' ? { error: err.message } : {})
    });
  }
};

// Confirm appointment after payment success
export const confirmAppointment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId;

    console.log("🔍 Confirming appointment:", { sessionId, userId });

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    // Find the booking by session ID and user ID
    const booking = await Booking.findOne({ 
      session: sessionId, 
      user: userId 
    }).populate('doctor', 'name email appointments');

    if (!booking) {
      console.log("❌ Booking not found:", { sessionId, userId });
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized"
      });
    }

    // Verify payment status with Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let stripeSession;
    
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      console.log("🔍 Stripe session status:", stripeSession.payment_status);
    } catch (stripeError) {
      console.log("❌ Error retrieving Stripe session:", stripeError.message);
      return res.status(400).json({
        success: false,
        message: "Invalid payment session"
      });
    }

    // Check if payment was successful via Stripe
    if (stripeSession.payment_status !== 'paid') {
      console.log("❌ Payment not completed via Stripe:", {
        sessionId,
        paymentStatus: stripeSession.payment_status
      });
      return res.status(400).json({
        success: false,
        message: "Payment not completed. Please complete payment first."
      });
    }

    // Update booking payment status if not already updated
    if (!booking.isPaid) {
      booking.isPaid = true;
      booking.paymentStatus = 'paid';
      await booking.save();
      console.log("✅ Updated booking payment status to paid");
    }

    // Check if already confirmed
    if (booking.status === "confirmed") {
      console.log("ℹ️ Appointment already confirmed:", booking._id);
      return res.status(200).json({
        success: true,
        message: "Appointment already confirmed",
        data: {
          bookingId: booking._id,
          status: booking.status,
          doctorName: booking.doctor.name
        }
      });
    }

    // Update booking status to confirmed
    booking.status = "confirmed";
    booking.confirmedAt = new Date();
    await booking.save();

    // Update the appointment in doctor's appointments array
    const doctor = await Doctor.findById(booking.doctor._id);
    if (doctor) {
      const appointmentIndex = doctor.appointments.findIndex(
        apt => apt.stripeSessionId === sessionId
      );
      
      if (appointmentIndex !== -1) {
        doctor.appointments[appointmentIndex].status = "confirmed";
        doctor.appointments[appointmentIndex].payment = "paid";
        doctor.appointments[appointmentIndex].confirmedAt = new Date();
        await doctor.save();
        console.log("✅ Updated appointment in doctor's list");
      }
    }

    console.log("✅ Appointment confirmed successfully:", {
      bookingId: booking._id,
      doctorName: booking.doctor.name,
      status: booking.status
    });

    // Send confirmation email to patient
    let emailResult = null;
    try {
      const user = await User.findById(booking.user._id);
      if (user && user.email) {
        const appointment = doctor.appointments.find(apt => apt.stripeSessionId === sessionId);
        
        const emailData = {
          patientEmail: user.email,
          patientName: user.name,
          doctorName: booking.doctor.name,
          appointmentDate: appointment?.appointmentDate || new Date(),
          appointmentTime: appointment?.appointmentTime || "To be scheduled"
        };

        emailResult = await sendAppointmentConfirmationEmail(emailData);
        console.log('📧 Confirmation email result:', emailResult);
      }
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
      // Don't fail the appointment confirmation if email fails
    }

    res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully!",
      data: {
        bookingId: booking._id,
        status: booking.status,
        doctorName: booking.doctor.name,
        ticketPrice: booking.ticketPrice,
        confirmedAt: booking.confirmedAt,
        emailSent: emailResult?.success || false
      }
    });

  } catch (error) {
    console.error("💥 Error confirming appointment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while confirming appointment"
    });
  }
};