import express from "express";
import { 
  register, 
  login, 
  googleAuth, 
  logout 
} from "../Controllers/authController.js";

const router = express.Router();

// Traditional auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Google OAuth routes
router.post("/google", googleAuth);

export default router;
