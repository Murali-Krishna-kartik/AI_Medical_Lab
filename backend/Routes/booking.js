import express from "express";
import { authenticate } from "./../auth/verifyToken.js";
import { getCheckoutSession, confirmAppointment } from "../Controllers/bookingController.js";

const router = express.Router();

router.post("/checkout-session/:doctorId", authenticate, getCheckoutSession);
router.post("/confirm-appointment", authenticate, confirmAppointment);

export default router;
