import mongoose from "mongoose";
import Doctor from "./models/DoctorSchema.js";
import User from "./models/UserSchema.js";
import Admin from "./models/AdminSchema.js";
import dotenv from "dotenv";

dotenv.config();

const checkDoctor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Check for doctor in all collections
    const doctorEmail = "kartik@gmail.com"; // Replace with the email you're trying to login with
    
    console.log(`\n🔍 Searching for doctor: ${doctorEmail}`);
    
    const userDoc = await User.findOne({ email: doctorEmail });
    const doctorDoc = await Doctor.findOne({ email: doctorEmail });
    const adminDoc = await Admin.findOne({ email: doctorEmail });
    
    console.log("\n📊 Results:");
    console.log("In User collection:", userDoc ? `Found - Role: ${userDoc.role}` : "Not found");
    console.log("In Doctor collection:", doctorDoc ? `Found - Role: ${doctorDoc.role}` : "Not found");
    console.log("In Admin collection:", adminDoc ? `Found - Role: ${adminDoc.role}` : "Not found");
    
    if (userDoc) {
      console.log("\n👤 User details:", {
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        hasPassword: !!userDoc.password
      });
    }
    
    if (doctorDoc) {
      console.log("\n👨‍⚕️ Doctor details:", {
        name: doctorDoc.name,
        email: doctorDoc.email,
        role: doctorDoc.role,
        hasPassword: !!doctorDoc.password,
        isApproved: doctorDoc.isApproved
      });
    }
    
    if (adminDoc) {
      console.log("\n👨‍💼 Admin details:", {
        name: adminDoc.name,
        email: adminDoc.email,
        role: adminDoc.role,
        hasPassword: !!adminDoc.password
      });
    }
    
    if (!userDoc && !doctorDoc && !adminDoc) {
      console.log("\n❌ No account found with this email in any collection!");
      console.log("The doctor needs to register first.");
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

checkDoctor();