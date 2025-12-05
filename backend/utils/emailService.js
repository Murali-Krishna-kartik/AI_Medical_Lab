import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Debug: Check if nodemailer is properly imported
console.log('📧 Nodemailer imported:', typeof nodemailer);
console.log('📧 createTransport method:', typeof nodemailer.createTransport);

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Support multiple email providers
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
  
  let transportConfig;
  
  switch (emailProvider.toLowerCase()) {
    case 'gmail':
      transportConfig = {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD, // Use App Password for Gmail
        },
      };
      break;
      
    case 'outlook':
      transportConfig = {
        service: 'hotmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      };
      break;
      
    case 'smtp':
      transportConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      };
      break;
      
    default:
      throw new Error(`Unsupported email provider: ${emailProvider}`);
  }
  
  return nodemailer.createTransport(transportConfig);
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    return false;
  }
};

// Generate simple appointment completion email HTML template
const generateAppointmentCompletionEmail = (appointmentData) => {
  const {
    patientName,
    doctorName,
    appointmentDate,
    appointmentTime,
    prescription,
    notes,
    clinicName = 'AI MedLab',
    clinicPhone = '+1 (555) 123-4567',
    clinicEmail = 'info@aimedlab.com'
  } = appointmentData;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Completed - ${clinicName}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 300;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
                font-size: 16px;
            }
            .content {
                padding: 30px;
            }
            .section {
                margin-bottom: 25px;
                padding: 20px;
                border-left: 4px solid #667eea;
                background-color: #f8f9ff;
                border-radius: 0 8px 8px 0;
            }
            .section h2 {
                color: #667eea;
                margin-top: 0;
                font-size: 18px;
                margin-bottom: 15px;
            }
            .info-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #e9ecef;
                margin-bottom: 15px;
            }
            .info-label {
                font-weight: 600;
                color: #495057;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .info-value {
                color: #212529;
                font-size: 16px;
            }
            .prescription-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 15px 0;
            }
            .notes-box {
                background: #e8f5e8;
                border: 1px solid #c3e6c3;
                border-radius: 8px;
                padding: 20px;
                margin: 15px 0;
            }
            .footer {
                background: #2d3436;
                color: white;
                padding: 20px;
                text-align: center;
            }
            .footer p {
                margin: 5px 0;
                font-size: 14px;
                opacity: 0.9;
            }
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                .content {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 ${clinicName}</h1>
                <p>Appointment Completed</p>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2>👋 Hello ${patientName}</h2>
                    <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been completed successfully.</p>
                </div>

                <div class="section">
                    <h2>📅 Appointment Details</h2>
                    <div class="info-item">
                        <div class="info-label">Doctor</div>
                        <div class="info-value">Dr. ${doctorName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date</div>
                        <div class="info-value">${new Date(appointmentDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Time</div>
                        <div class="info-value">${appointmentTime}</div>
                    </div>
                </div>

                ${prescription ? `
                <div class="section">
                    <h2>💊 Prescription</h2>
                    <div class="prescription-box">
                        <p style="margin: 0; font-size: 16px; line-height: 1.6;">${prescription}</p>
                    </div>
                </div>
                ` : ''}

                ${notes ? `
                <div class="section">
                    <h2>📝 Doctor's Notes</h2>
                    <div class="notes-box">
                        <p style="margin: 0; font-size: 16px; line-height: 1.6;">${notes}</p>
                    </div>
                </div>
                ` : ''}

                <div class="section">
                    <h2>📞 Contact Information</h2>
                    <p>If you have any questions, please contact us:</p>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${clinicPhone}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${clinicEmail}</div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${clinicName}. All rights reserved.</p>
                <p style="font-size: 12px; opacity: 0.8;">
                    This email contains confidential medical information.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send appointment completion email
export const sendAppointmentCompletionEmail = async (appointmentData) => {
  try {
    const transporter = createTransporter();
    
    const {
      patientEmail,
      patientName,
      doctorName,
      appointmentDate,
      clinicName = 'AI MedLab'
    } = appointmentData;

    if (!patientEmail) {
      throw new Error('Patient email is required');
    }

    const mailOptions = {
      from: {
        name: clinicName,
        address: process.env.EMAIL_USER
      },
      to: patientEmail,
      subject: `🏥 Appointment Completed - ${doctorName} | ${clinicName}`,
      html: generateAppointmentCompletionEmail(appointmentData),
      // Add text version for better compatibility
      text: `
        Dear ${patientName},
        
        Your appointment with Dr. ${doctorName} on ${new Date(appointmentDate).toLocaleDateString()} has been completed successfully.
        
        Please check your email for detailed information about your prescription and follow-up instructions.
        
        If you have any questions, please contact us at ${process.env.EMAIL_USER}.
        
        Best regards,
        ${clinicName} Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Appointment completion email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    console.error('❌ Error sending appointment completion email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Send appointment confirmation email (for when appointment is booked)
export const sendAppointmentConfirmationEmail = async (appointmentData) => {
  try {
    const transporter = createTransporter();
    
    const {
      patientEmail,
      patientName,
      doctorName,
      appointmentDate,
      appointmentTime,
      clinicName = 'AI MedLab'
    } = appointmentData;

    const mailOptions = {
      from: {
        name: clinicName,
        address: process.env.EMAIL_USER
      },
      to: patientEmail,
      subject: `✅ Appointment Confirmed - ${doctorName} | ${clinicName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🏥 ${clinicName}</h1>
            <h2>Appointment Confirmed!</h2>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
            <p>Dear ${patientName},</p>
            
            <p>Your appointment has been confirmed successfully!</p>
            
            <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">📅 Appointment Details</h3>
              <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
              <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
            </div>
            
            <p>Please arrive 15 minutes early for your appointment. If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_SITE_URL}/users/profile/me" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View My Appointments</a>
            </div>
            
            <p>Best regards,<br>${clinicName} Team</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Appointment confirmation email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Confirmation email sent successfully'
    };
    
  } catch (error) {
    console.error('❌ Error sending appointment confirmation email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send confirmation email'
    };
  }
};

export default {
  verifyEmailConfig,
  sendAppointmentCompletionEmail,
  sendAppointmentConfirmationEmail
};