import mongoose from "mongoose";
import Doctor from "./models/DoctorSchema.js";
import User from "./models/UserSchema.js";
import dotenv from "dotenv";

dotenv.config();

const migrateAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB for migration");

    // Find all doctors with appointments
    const doctors = await Doctor.find({ "appointments.0": { $exists: true } });
    console.log(`📋 Found ${doctors.length} doctors with appointments`);

    let totalUpdated = 0;

    for (const doctor of doctors) {
      let doctorUpdated = false;
      
      for (const appointment of doctor.appointments) {
        // If appointment doesn't have patientId, try to find it by name
        if (!appointment.patientId && appointment.patientName) {
          const user = await User.findOne({ 
            name: { $regex: new RegExp(appointment.patientName, 'i') } 
          });
          
          if (user) {
            appointment.patientId = user._id;
            doctorUpdated = true;
            console.log(`✅ Updated appointment for ${appointment.patientName} with patientId: ${user._id}`);
          } else {
            // Create a placeholder user if none found
            console.log(`⚠️  No user found for ${appointment.patientName}, keeping without patientId`);
          }
        }
        
        // Ensure all required fields have defaults
        if (!appointment.patientName) appointment.patientName = "Unknown Patient";
        if (!appointment.price) appointment.price = "100";
        if (!appointment.bookedOn) appointment.bookedOn = new Date().toLocaleDateString();
        if (!appointment.testName) appointment.testName = "General Consultation";
        if (!appointment.status) appointment.status = "pending";
        if (!appointment.payment) appointment.payment = "pending";
        if (!appointment.appointmentDate) appointment.appointmentDate = new Date();
        if (!appointment.appointmentTime) appointment.appointmentTime = "Not specified";
      }

      if (doctorUpdated) {
        await doctor.save();
        totalUpdated++;
        console.log(`📝 Updated doctor: ${doctor.name}`);
      }
    }

    console.log(`🎉 Migration completed! Updated ${totalUpdated} doctors`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateAppointments();