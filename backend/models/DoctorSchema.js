import mongoose, { Schema } from "mongoose";

const Appointment = new Schema({
  patientId: { type: mongoose.Types.ObjectId, ref: "User" }, // Made optional for backward compatibility
  patientName: { type: String, default: "Unknown Patient" },
  patientGender: { type: String, enum: ["male", "female", "other"], default: "other" },
  payment: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  price: { type: String, default: "100" },
  bookedOn: { type: String, default: () => new Date().toLocaleDateString() },
  testName: { type: String, default: "General Consultation" },
  testResult: String,
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  appointmentDate: { type: Date, default: Date.now },
  appointmentTime: { type: String, default: "Not specified" },
  notes: String,
  prescription: String,
}, { timestamps: true });

const DoctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.isGoogleUser; } },
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String },
  ticketPrice: { type: Number },
  role: {
    type: String,
    enum: ["doctor"],
    default: "doctor",
  },
  gender: { type: String, enum: ["male", "female", "other"], required: function() { return !this.isGoogleUser; } },

  // Fields for doctors only
  specialization: { type: String },
  qualifications: {
    type: Array,
  },

  experiences: {
    type: Array,
  },

  bio: { type: String, maxLength: 50 },
  about: { type: String },
  timeSlots: { type: Array },
  reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  isApproved: {
    type: String,
    enum: ["pending", "approved", "cancelled"],
    default: "pending",
  },
  appointments: [Appointment],
  
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  isGoogleUser: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Doctor", DoctorSchema);
