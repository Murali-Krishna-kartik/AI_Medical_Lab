import express from "express";
import {
  updateUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  getUserProfile,
  getMyAppointments,
  createAppointment,
  updateAppointmentStatus,
} from "../Controllers/userController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

// router.get("/:id", authenticate, restrict(["patient"]), getSingleUser); // Fetch a single user
// router.get("/", authenticate, restrict(["admin"]), getAllUsers); // Fetch all users
// router.delete("/:id", authenticate, restrict(["patient"]), deleteUser); // Delete a user
// router.put("/:id", authenticate, restrict(["patient"]), updateUser); // Update a user
// router.get("/profile/me", authenticate, restrict(["patient"]), getUserProfile); // get userProfile
// router.get(
//   "/appointments/my-appointments",
//   authenticate,
//   restrict(["patient"]),
//   getMyAppointments
// ); // get myappointments
// router.post(
//   "/appointments/create-appointment",
//   authenticate,
//   restrict(["patient"]),
//   createAppointment
// ); // create appointment
// specific first
router.get("/profile/me", authenticate, restrict(["patient"]), getUserProfile);
router.get("/appointments/my-appointments", authenticate, restrict(["patient"]), getMyAppointments);
router.post("/appointments/create-appointment", authenticate, restrict(["patient"]), createAppointment);
router.put("/appointments/:doctorId/:appointmentId/status", authenticate, updateAppointmentStatus);

// only then generic param routes; also constrain to valid ObjectId
router.get("/:id([0-9a-fA-F]{24})", authenticate, restrict(["patient"]), getSingleUser);
router.put("/:id([0-9a-fA-F]{24})", authenticate, restrict(["patient"]), updateUser);
router.delete("/:id([0-9a-fA-F]{24})", authenticate, restrict(["patient"]), deleteUser);


export default router;
