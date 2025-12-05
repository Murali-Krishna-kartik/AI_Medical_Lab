import express from "express";
import { 
  completeAppointment, 
  getAppointmentForCompletion, 
  updateAppointmentDetails,
  sendConfirmationEmail,
  getCompletedAppointments
} from "../Controllers/appointmentController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

// All routes require authentication and doctor role
router.use(authenticate);
router.use(restrict(['doctor']));

// Get appointment details for completion form
router.get('/:appointmentId/details', getAppointmentForCompletion);

// Update appointment details (prescription, notes, etc.) - partial update
router.put('/:appointmentId/update', updateAppointmentDetails);

// Complete appointment with prescription and send email
router.post('/:appointmentId/complete', completeAppointment);

// Send confirmation email for appointment
router.post('/:appointmentId/send-confirmation', sendConfirmationEmail);

// Get all completed appointments for the doctor
router.get('/completed', getCompletedAppointments);

export default router;