import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.isGoogleUser; } },
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String },
  role: {
    type: String,
    enum: ["patient"],
    default: "patient",
  },
  gender: { type: String, enum: ["male", "female", "other"] },
  bloodType: { type: String },
  appointments: [{ type: mongoose.Types.ObjectId, ref: "Appointment" }],
  
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  isGoogleUser: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
