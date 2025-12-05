/**
 * Test script to debug booking issues
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "./models/DoctorSchema.js";
import User from "./models/UserSchema.js";

dotenv.config();

async function testBookingData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Check doctors
    const doctors = await Doctor.find({}).limit(5);
    console.log("\n📋 Doctor Data Check:");
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. Doctor: ${doctor.name}`);
      console.log(`   ID: ${doctor._id}`);
      console.log(`   Ticket Price: ${doctor.ticketPrice} (Type: ${typeof doctor.ticketPrice})`);
      console.log(`   Bio: ${doctor.bio ? doctor.bio.substring(0, 50) + '...' : 'No bio'}`);
      console.log(`   Photo: ${doctor.photo ? 'Yes' : 'No'}`);
      console.log(`   Approved: ${doctor.isApproved}`);
      console.log("   ---");
    });

    // Check users
    const users = await User.find({}).limit(3);
    console.log("\n👥 User Data Check:");
    users.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.name}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log("   ---");
    });

    // Check environment variables
    console.log("\n🔧 Environment Variables Check:");
    console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'Set (length: ' + process.env.STRIPE_SECRET_KEY.length + ')' : 'Not set'}`);
    console.log(`CLIENT_SITE_URL: ${process.env.CLIENT_SITE_URL || 'Not set'}`);
    console.log(`MONGO_URL: ${process.env.MONGO_URL ? 'Set' : 'Not set'}`);

    // Test Stripe key validity
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        // Test a simple Stripe API call
        const account = await stripe.accounts.retrieve();
        console.log(`✅ Stripe connection successful. Account ID: ${account.id}`);
      } catch (stripeError) {
        console.log(`❌ Stripe connection failed: ${stripeError.message}`);
      }
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

testBookingData();