import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoute from "./Routes/auth.js";
import userRoute from "./Routes/user.js";
import doctorRoute from "./Routes/doctor.js";
import reviewRoute from "./Routes/review.js";
import bookingRoute from "./Routes/booking.js";
import diseaseRoute from "./Routes/disease.js";
import adminRoute from "./Routes/admin.js";
import appointmentRoute from "./Routes/appointment.js";

import healthRoute from "./Routes/healthPredict.js";
import syncRoute from "./Routes/sync.js";
import webhookRoute from "./Routes/webhook.js";
import paymentRoute from "./Routes/payment.js";


dotenv.config();

// Debug: Log environment variables on startup
console.log("🔧 Environment Variables Loaded:");
console.log("CLIENT_SITE_URL:", process.env.CLIENT_SITE_URL);
console.log("PORT:", process.env.PORT);

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174", 
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://accounts.google.com",
      "https://www.googleapis.com",
      "https://content-googleapis.com",
      "https://oauth2.googleapis.com"
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins for development
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods"
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// quick sanity: surface missing envs early
["MONGO_URL","JWT_SECRET"].forEach(k=>{
  if(!process.env[k]) console.error(`ENV MISSING: ${k}`);
});

mongoose.set("strictQuery", false);

const connectDB = async (retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds
  
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error(`❌ Mongoose connection failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);
    
    if (retryCount < maxRetries) {
      console.log(`⏳ Retrying connection in ${retryDelay/1000} seconds...`);
      setTimeout(() => connectDB(retryCount + 1), retryDelay);
    } else {
      console.error("💥 Max connection retries reached. Exiting...");
      process.exit(1);
    }
  }
};

app.use(cookieParser());
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Webhook route MUST come before express.json() middleware for raw body
app.use("/api/v1/webhook", webhookRoute);

app.use(express.json());

app.get("/", (req, res) => res.send("API is working ✅"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/appointments", appointmentRoute);
app.use("/api/v1/", diseaseRoute);
app.use("/api/v1/admin", adminRoute);

app.use("/api/v1/", healthRoute);
app.use("/api/v1/sync", syncRoute);
app.use("/api/v1/payment", paymentRoute);


// global error handler (so 500s show a real message)
app.use((err, req, res, next) => {
  console.error("💥 Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(port, async () => {
  await connectDB();
  console.log(`🚀 Server is running on port ${port}`);
});
