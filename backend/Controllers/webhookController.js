import Stripe from "stripe";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook signature verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'checkout.session.expired':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

const handlePaymentSuccess = async (session) => {
  try {
    console.log("💰 Payment successful for session:", session.id);
    
    // Find the booking by session ID
    const booking = await Booking.findOne({ session: session.id }).populate('doctor');
    if (!booking) {
      console.error("❌ Booking not found for session:", session.id);
      return;
    }

    // Update booking status
    booking.isPaid = true;
    booking.status = "approved";
    await booking.save();
    console.log("✅ Booking updated to paid status");

    // Update appointment in doctor's appointments array
    const doctor = booking.doctor;
    const appointment = doctor.appointments.find(apt => 
      apt.stripeSessionId === session.id || apt.bookingId?.toString() === booking._id.toString()
    );

    if (appointment) {
      appointment.payment = "completed";
      appointment.status = "confirmed";
      appointment.notes = `Payment completed. ${appointment.notes}`;
      await doctor.save();
      console.log("✅ Appointment status updated to confirmed");
    } else {
      console.error("❌ Appointment not found for session:", session.id);
    }

  } catch (error) {
    console.error("💥 Error handling payment success:", error);
  }
};

const handlePaymentFailed = async (session) => {
  try {
    console.log("❌ Payment failed/expired for session:", session.id);
    
    // Find the booking by session ID
    const booking = await Booking.findOne({ session: session.id }).populate('doctor');
    if (!booking) {
      console.error("❌ Booking not found for session:", session.id);
      return;
    }

    // Update booking status
    booking.isPaid = false;
    booking.status = "cancelled";
    await booking.save();

    // Update appointment in doctor's appointments array
    const doctor = booking.doctor;
    const appointment = doctor.appointments.find(apt => 
      apt.stripeSessionId === session.id || apt.bookingId?.toString() === booking._id.toString()
    );

    if (appointment) {
      appointment.payment = "failed";
      appointment.status = "cancelled";
      appointment.notes = `Payment failed/expired. ${appointment.notes}`;
      await doctor.save();
      console.log("✅ Appointment status updated to cancelled");
    }

  } catch (error) {
    console.error("💥 Error handling payment failure:", error);
  }
};