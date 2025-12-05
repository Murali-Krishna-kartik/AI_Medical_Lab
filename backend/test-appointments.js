/**
 * Test script to verify appointment system functionality
 * Run with: node test-appointments.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "./models/DoctorSchema.js";
import Booking from "./models/BookingSchema.js";
import User from "./models/UserSchema.js";

dotenv.config();

const testAppointmentSystem = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Test 1: Check existing appointments
    console.log("\n🔍 TEST 1: Checking existing appointments...");
    const doctors = await Doctor.find({}).select('name appointments');
    
    let totalAppointments = 0;
    doctors.forEach(doctor => {
      const appointmentCount = doctor.appointments ? doctor.appointments.length : 0;
      totalAppointments += appointmentCount;
      console.log(`👨‍⚕️ Dr. ${doctor.name}: ${appointmentCount} appointments`);
    });
    console.log(`📊 Total appointments across all doctors: ${totalAppointments}`);

    // Test 2: Check bookings
    console.log("\n🔍 TEST 2: Checking existing bookings...");
    const bookings = await Booking.find({}).populate('doctor', 'name').populate('user', 'name');
    console.log(`📋 Total bookings: ${bookings.length}`);
    
    bookings.forEach(booking => {
      console.log(`💳 Booking ${booking._id}: ${booking.user?.name} → Dr. ${booking.doctor?.name} (Paid: ${booking.isPaid})`);
    });

    // Test 3: Check for duplicates
    console.log("\n🔍 TEST 3: Checking for duplicate appointments...");
    let duplicateCount = 0;
    const sessionIds = new Set();
    
    doctors.forEach(doctor => {
      if (doctor.appointments) {
        doctor.appointments.forEach(apt => {
          if (apt.stripeSessionId) {
            if (sessionIds.has(apt.stripeSessionId)) {
              duplicateCount++;
              console.log(`⚠️ Duplicate found: Session ${apt.stripeSessionId} in Dr. ${doctor.name}`);
            } else {
              sessionIds.add(apt.stripeSessionId);
            }
          }
        });
      }
    });
    console.log(`🔍 Found ${duplicateCount} duplicate appointments`);

    // Test 4: Appointment statistics
    console.log("\n📊 TEST 4: Appointment Statistics...");
    let pending = 0, confirmed = 0, completed = 0, cancelled = 0;
    let paidCount = 0, pendingPayments = 0;
    let totalRevenue = 0;

    doctors.forEach(doctor => {
      if (doctor.appointments) {
        doctor.appointments.forEach(apt => {
          // Status counts
          if (apt.status === 'pending') pending++;
          else if (apt.status === 'confirmed') confirmed++;
          else if (apt.status === 'completed') completed++;
          else if (apt.status === 'cancelled') cancelled++;

          // Payment counts
          if (apt.payment === 'completed') {
            paidCount++;
            totalRevenue += parseFloat(apt.price) || 0;
          } else if (apt.payment === 'pending') {
            pendingPayments++;
          }
        });
      }
    });

    console.log(`📈 Status Distribution:`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Confirmed: ${confirmed}`);
    console.log(`   Completed: ${completed}`);
    console.log(`   Cancelled: ${cancelled}`);
    console.log(`💰 Payment Status:`);
    console.log(`   Paid: ${paidCount} ($${totalRevenue.toFixed(2)})`);
    console.log(`   Pending: ${pendingPayments}`);

    // Test 5: Data integrity check
    console.log("\n🔍 TEST 5: Data Integrity Check...");
    let appointmentsWithBookingId = 0;
    let appointmentsWithSessionId = 0;
    let appointmentsWithPatientInfo = 0;

    doctors.forEach(doctor => {
      if (doctor.appointments) {
        doctor.appointments.forEach(apt => {
          if (apt.bookingId) appointmentsWithBookingId++;
          if (apt.stripeSessionId) appointmentsWithSessionId++;
          if (apt.patientName && apt.patientName !== 'Unknown Patient') appointmentsWithPatientInfo++;
        });
      }
    });

    console.log(`🔗 Appointments with booking ID: ${appointmentsWithBookingId}/${totalAppointments}`);
    console.log(`💳 Appointments with session ID: ${appointmentsWithSessionId}/${totalAppointments}`);
    console.log(`👤 Appointments with patient info: ${appointmentsWithPatientInfo}/${totalAppointments}`);

    // Summary
    console.log("\n🎯 SYSTEM HEALTH SUMMARY:");
    console.log(`✅ Total Doctors: ${doctors.length}`);
    console.log(`✅ Total Bookings: ${bookings.length}`);
    console.log(`✅ Total Appointments: ${totalAppointments}`);
    console.log(`${duplicateCount > 0 ? '⚠️' : '✅'} Duplicates: ${duplicateCount}`);
    console.log(`${totalAppointments === bookings.length ? '✅' : '⚠️'} Booking-Appointment Sync: ${totalAppointments}/${bookings.length}`);
    
    if (duplicateCount > 0) {
      console.log("\n🔧 RECOMMENDED ACTIONS:");
      console.log("1. Run: POST /api/v1/sync/cleanup-duplicates");
      console.log("2. Run: POST /api/v1/sync/bookings-to-appointments");
    } else if (totalAppointments < bookings.length) {
      console.log("\n🔧 RECOMMENDED ACTIONS:");
      console.log("1. Run: POST /api/v1/sync/bookings-to-appointments");
    } else {
      console.log("\n🎉 SYSTEM STATUS: HEALTHY - No action required!");
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
};

// Run the test
testAppointmentSystem();