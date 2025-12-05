import express from "express";
import {
  updateDoctor,
  deleteDoctor,
  getAllDoctors,
  getSingleDoctor,
  getDoctorProfile,
  updateDoctorAppointment,
  getDoctorAppointments,
  deleteDoctorAppointment,
  getSingleAppointment,
  bulkUpdateAppointments,
  scheduleAppointmentTime,
  getAppointmentDashboard,
  testEmailNotification,
} from "../Controllers/doctorController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";
import reviewRouter from "./review.js";

const router = express.Router();

// Debug middleware to log all requests to doctor routes
router.use((req, res, next) => {
  console.log(`\n🔍 ===== DOCTOR ROUTE REQUEST =====`);
  console.log(`🔍 METHOD: ${req.method}`);
  console.log(`🔍 URL: ${req.originalUrl}`);
  console.log(`🔍 PATH: ${req.path}`);
  console.log(`🔍 PARAMS:`, req.params);
  console.log(`🔍 QUERY:`, req.query);
  console.log(`🔍 AUTH HEADER:`, req.headers.authorization ? 'Token present' : 'No token');
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`🔍 BODY:`, req.body);
  }
  console.log(`🔍 ===== END ROUTE REQUEST =====\n`);
  next();
});

//nested route
router.use("/:doctorId/reviews", reviewRouter);

// Get doctor's profile
router.get("/profile/me", authenticate, restrict(["doctor"]), getDoctorProfile);

// Appointment management routes for doctors
router.get("/appointments/dashboard", authenticate, restrict(["doctor"]), getAppointmentDashboard);
router.get("/appointments/my-appointments", authenticate, restrict(["doctor"]), getDoctorAppointments);
router.get("/appointments/:appointmentId", authenticate, restrict(["doctor"]), getSingleAppointment);
router.put("/appointments/:appointmentId", authenticate, restrict(["doctor"]), updateDoctorAppointment);
router.put("/appointments/:appointmentId/schedule", authenticate, restrict(["doctor"]), scheduleAppointmentTime);
router.delete("/appointments/:appointmentId", authenticate, restrict(["doctor"]), deleteDoctorAppointment);
router.put("/appointments/bulk-update", authenticate, restrict(["doctor"]), bulkUpdateAppointments);

// Email notification test route
router.post("/test-email", authenticate, restrict(["doctor"]), testEmailNotification);

// Test route to verify appointment update route is working
router.get("/test-route", authenticate, restrict(["doctor"]), (req, res) => {
  console.log("🔍 TEST ROUTE CALLED - Routes are working!");
  res.json({ success: true, message: "Route is working", userId: req.userId });
});

router.get("/:id", getSingleDoctor); // Fetch a single Doctor
router.get("/", getAllDoctors); // Fetch all Doctors
router.delete("/:id", authenticate, restrict(["doctor"]), deleteDoctor); // Delete a Doctor
router.put("/:id", authenticate, restrict(["doctor"]), updateDoctor); // Update a doctor

export default router;
