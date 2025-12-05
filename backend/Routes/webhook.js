import express from "express";
import { handleStripeWebhook } from "../Controllers/webhookController.js";

const router = express.Router();

// Stripe webhook endpoint (raw body needed for signature verification)
router.post("/stripe", express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;