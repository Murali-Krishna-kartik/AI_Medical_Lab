import { verifyEmailConfig, sendAppointmentCompletionEmail } from './utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

// Test email configuration
const testEmailService = async () => {
  console.log('🧪 Testing Email Service Configuration...\n');
  
  // Test 1: Verify email configuration
  console.log('1️⃣ Testing email configuration...');
  const isConfigValid = await verifyEmailConfig();
  
  if (!isConfigValid) {
    console.log('❌ Email configuration failed. Please check your .env settings.');
    return;
  }
  
  console.log('✅ Email configuration is valid!\n');
  
  // Test 2: Send a test appointment completion email
  console.log('2️⃣ Sending test appointment completion email...');
  
  const testAppointmentData = {
    patientEmail: 'muraliaddaganti@gmail.com', // Using the same email for testing
    patientName: 'John Doe',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpecialization: 'Cardiology',
    appointmentDate: new Date(),
    appointmentTime: '10:00 AM',
    diagnosis: 'Mild hypertension - well controlled with current medication',
    prescription: [
      {
        name: 'Lisinopril 10mg',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with food in the morning'
      },
      {
        name: 'Aspirin 81mg',
        dosage: '81mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with food to prevent stomach upset'
      }
    ],
    testResults: 'Blood pressure: 130/85 mmHg, Heart rate: 72 bpm, ECG: Normal sinus rhythm',
    notes: 'Patient is responding well to current treatment. Continue current medications and maintain healthy lifestyle. Regular exercise and low-sodium diet recommended.',
    followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };
  
  try {
    const result = await sendAppointmentCompletionEmail(testAppointmentData);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📬 Check your email inbox for the appointment completion email.');
    } else {
      console.log('❌ Failed to send test email:', result.message);
    }
  } catch (error) {
    console.log('❌ Error sending test email:', error.message);
  }
  
  console.log('\n🎉 Email service test completed!');
};

// Run the test
testEmailService().catch(console.error);