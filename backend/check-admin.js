// Simple script to check admin users in the database
import mongoose from "mongoose";
import Admin from "./db-models/AdminSchema.js";
import dotenv from "dotenv";

dotenv.config();

const checkAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Get all admins
    const admins = await Admin.find({}).select("-password");
    
    console.log("\n📊 Admin Users Found:", admins.length);
    
    if (admins.length === 0) {
      console.log("❌ No admin users found in the database!");
      console.log("💡 Run 'node create-admin.js' to create a test admin");
    } else {
      console.log("\n👨‍💼 Admin Details:");
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Permissions: ${admin.permissions.join(', ')}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log(`   Last Login: ${admin.lastLogin || 'Never'}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error checking admins:", error);
  } finally {
    mongoose.connection.close();
  }
};

checkAdmins();