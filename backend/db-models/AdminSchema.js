import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.isGoogleUser; } },
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String },
  role: {
    type: String,
    default: "admin",
    immutable: true, // Prevent role changes
  },
  permissions: {
    type: [String],
    default: [
      "manage_users",
      "manage_doctors",
      "manage_bookings",
      "view_analytics",
    ],
  },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  isGoogleUser: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
});

// Update the updatedAt field before saving
AdminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Admin", AdminSchema);
