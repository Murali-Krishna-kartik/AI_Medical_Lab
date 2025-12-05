import nodemailer from 'nodemailer';

console.log('🔍 Testing nodemailer import...');
console.log('nodemailer object:', typeof nodemailer);
console.log('createTransport method:', typeof nodemailer.createTransport);

// Test creating a transporter
try {
  const testTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test@gmail.com',
      pass: 'testpass'
    }
  });
  
  console.log('✅ Transporter created successfully');
  console.log('Transporter type:', typeof testTransporter);
  console.log('Verify method:', typeof testTransporter.verify);
} catch (error) {
  console.error('❌ Error creating transporter:', error.message);
}