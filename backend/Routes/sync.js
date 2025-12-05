import express from "express";
import { authenticate } from "../auth/verifyToken.js";
import { restrict } from "../auth/verifyToken.js";
import { 
  syncBookingsToAppointments, 
  getAppointmentStats,
  cleanupDuplicateAppointments
} from "../Controllers/syncController.js";

const router = express.Router();

// Sync existing bookings to appointments (admin only)
router.post("/bookings-to-appointments", authenticate, restrict(["admin"]), syncBookingsToAppointments);

// Get comprehensive appointment statistics (admin only)
router.get("/appointment-stats", authenticate, restrict(["admin"]), getAppointmentStats);

// Clean up duplicate appointments (admin only)
router.post("/cleanup-duplicates", authenticate, restrict(["admin"]), cleanupDuplicateAppointments);

export default router;