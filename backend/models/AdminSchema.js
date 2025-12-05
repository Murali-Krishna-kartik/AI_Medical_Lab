import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
    immutable: true, // Prevent role changes
  },
  permissions: {
    type: [String],
    default: ["manage_users", "manage_doctors", "manage_bookings", "view_analytics"],
  },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
AdminSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Admin", AdminSchema);