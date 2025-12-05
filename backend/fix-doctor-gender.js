import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "./models/DoctorSchema.js";

dotenv.config();

const fixDoctorGender = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    
    // Find all doctors without gender field
    const doctorsWithoutGender = await Doctor.find({ 
      $or: [
        { gender: { $exists: false } },
        { gender: null },
        { gender: "" }
      ]
    });
    
    console.log(`Found ${doctorsWithoutGender.length} doctors without gender field`);
    
    // Update each doctor to have a default gender
    for (const doctor of doctorsWithoutGender) {
      await Doctor.findByIdAndUpdate(
        doctor._id,
        { $set: { gender: "other" } },
        { runValidators: false }
      );
      console.log(`Fixed gender for doctor: ${doctor.name} (${doctor.email})`);
    }
    
    console.log("✅ All doctors now have gender field");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

fixDoctorGender();