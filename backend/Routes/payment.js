import express from "express";
import { authenticate, restrict } from "../auth/verifyToken.js";
import { 
  updatePaymentStatus, 
  getAllBookingsWithPaymentStatus,
  simulatePaymentSuccess
} from "../Controllers/paymentController.js";

const router = express.Router();

// Get all bookings with payment status (admin only)
router.get("/bookings", authenticate, restrict(["admin"]), getAllBookingsWithPaymentStatus);

// Update payment status manually (admin only)
router.put("/update-status", authenticate, restrict(["admin"]), updatePaymentStatus);

// Simulate payment success for testing (admin only)
router.post("/simulate-success", authenticate, restrict(["admin"]), simulatePaymentSuccess);

export default router;