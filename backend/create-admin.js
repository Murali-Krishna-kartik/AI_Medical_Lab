// Simple script to create an admin user for testing
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./db-models/AdminSchema.js";
import dotenv from "dotenv";

dotenv.config();

const createTestAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@test.com" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = new Admin({
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword,
      phone: 1234567890,
      role: "admin",
      permissions: ["manage_users", "manage_doctors", "manage_bookings", "view_analytics"]
    });

    await admin.save();
    console.log("✅ Test admin created successfully!");
    console.log("Email: admin@test.com");
    console.log("Password: admin123");
    
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

createTestAdmin();