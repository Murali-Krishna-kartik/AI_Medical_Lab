import { verifyEmailConfig, sendAppointmentCompletionEmail } from './utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing email service...');

// Test email configuration
const testEmail = async () => {
  try {
    console.log('📧 Verifying email configuration...');
    const isConfigValid = await verifyEmailConfig();
    
    if (!isConfigValid) {
      console.log('❌ Email configuration is invalid');
      return;
    }
    
    console.log('✅ Email configuration is valid');
    
    // Test sending completion email
    const testData = {
      patientName: 'John Doe',
      patientEmail: 'muraliaddaganti@gmail.com', // Using your email for testing
      doctorName: 'Dr. Smith',
      appointmentDate: new Date(),
      appointmentTime: '10:00 AM',
      prescription: 'Take rest and drink plenty of water. Paracetamol 500mg twice daily for 3 days.',
      notes: 'Patient is recovering well. Follow up in 1 week if symptoms persist.',
      clinicName: 'AI MedLab'
    };
    
    console.log('📧 Sending test completion email...');
    const result = await sendAppointmentCompletionEmail(testData);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.log('❌ Failed to send test email:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
};

testEmail();