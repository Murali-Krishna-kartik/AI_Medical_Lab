import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "./models/DoctorSchema.js";

dotenv.config();

const debugAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Find a doctor with appointments
    const doctor = await Doctor.findOne({ 
      appointments: { $exists: true, $ne: [] } 
    }).select('name appointments');

    if (!doctor) {
      console.log("❌ No doctor found with appointments");
      return;
    }

    console.log(`🔍 Doctor: ${doctor.name}`);
    console.log(`📋 Total appointments: ${doctor.appointments.length}`);

    // Check the first few appointments
    const sampleAppointments = doctor.appointments.slice(0, 3);
    
    sampleAppointments.forEach((apt, index) => {
      console.log(`\n📋 Appointment ${index + 1}:`);
      console.log(`   ID: ${apt._id}`);
      console.log(`   Patient Name: ${apt.patientName || 'NOT SET'}`);
      console.log(`   Patient Email: ${apt.patientEmail || 'NOT SET'}`);
      console.log(`   Status: ${apt.status || 'NOT SET'}`);
      console.log(`   Payment: ${apt.payment || 'NOT SET'}`);
      console.log(`   All fields:`, Object.keys(apt.toObject ? apt.toObject() : apt));
    });

  } catch (error) {
    console.error("❌ Debug failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
};

debugAppointments();