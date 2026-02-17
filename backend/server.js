import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Security Packages
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";

// Routes
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// Middleware
import errorMiddleware from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ==================
// 🔐 SECURITY LAYER
// ==================

app.use(helmet()); // Secure HTTP headers
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP param pollution

const limiter = rateLimit({
  max: 100, // max 100 requests
  windowMs: 15 * 60 * 1000, // per 15 minutes
  message: "Too many requests, please try again later",
});

app.use(limiter);

// ==================
// 🌍 BASIC MIDDLEWARE
// ==================

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// ==================
// 🔌 SOCKET.IO
// ==================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

// Make io accessible in routes
app.set("io", io);

// ==================
// 📦 ROUTES
// ==================

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// ==================
// ❌ GLOBAL ERROR HANDLER
// ==================

app.use(errorMiddleware);

// ==================
// 🗄 DATABASE CONNECTION
// ==================

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("DB Error:", err.message);
  });