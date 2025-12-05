import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "./models/DoctorSchema.js";
import User from "./models/UserSchema.js";
import { sendAppointmentCompletionEmail } from "./utils/emailService.js";

dotenv.config();

const testCompleteFlow = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Find a doctor with confirmed appointments
    const doctor = await Doctor.findOne({ 
      appointments: { 
        $elemMatch: { status: "confirmed" } 
      } 
    }).select('name appointments');

    if (!doctor) {
      console.log("❌ No doctor found with confirmed appointments");
      return;
    }

    console.log(`🔍 Doctor: ${doctor.name}`);
    
    // Find a confirmed appointment
    const confirmedAppointment = doctor.appointments.find(apt => apt.status === "confirmed");
    
    if (!confirmedAppointment) {
      console.log("❌ No confirmed appointment found");
      return;
    }

    console.log(`📋 Found confirmed appointment:`);
    console.log(`   ID: ${confirmedAppointment._id}`);
    console.log(`   Patient Name: ${confirmedAppointment.patientName}`);
    console.log(`   Patient ID: ${confirmedAppointment.patientId}`);
    console.log(`   Status: ${confirmedAppointment.status}`);

    // Get patient email
    let patientEmail = confirmedAppointment.patientEmail;
    
    if (!patientEmail && confirmedAppointment.patientId) {
      console.log('🔍 Fetching patient email from User collection...');
      const patient = await User.findById(confirmedAppointment.patientId).select('email name');
      if (patient && patient.email) {
        patientEmail = patient.email;
        console.log('✅ Found patient email:', patientEmail);
        console.log('✅ Patient name from User:', patient.name);
      } else {
        console.log('❌ Patient not found or no email available');
      }
    }

    if (!patientEmail) {
      console.log("❌ No patient email available - cannot send email");
      return;
    }

    // Test email sending
    const emailData = {
      patientName: confirmedAppointment.patientName || 'Patient',
      patientEmail: patientEmail,
      doctorName: doctor.name,
      appointmentDate: confirmedAppointment.appointmentDate || new Date(),
      appointmentTime: confirmedAppointment.appointmentTime || 'Not specified',
      prescription: 'Take rest and drink plenty of water. Paracetamol 500mg twice daily for 3 days.',
      notes: 'Patient is recovering well. Follow up in 1 week if symptoms persist.',
      clinicName: 'AI MedLab'
    };

    console.log('\n📧 Testing email sending...');
    console.log('📧 Email data:', emailData);

    const emailResult = await sendAppointmentCompletionEmail(emailData);
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', emailResult.messageId);
    } else {
      console.log('❌ Email sending failed:', emailResult.error);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
};

testCompleteFlow();