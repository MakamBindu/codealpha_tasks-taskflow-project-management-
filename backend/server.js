import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";
import mongoose from "mongoose";   // ✅ MISSING IMPORT ADDED

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

app.use(helmet());
app.use(xss());
app.use(hpp());

const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests, please try again later",
});

app.use(limiter);

// ==================
// 🌍 BASIC MIDDLEWARE
// ==================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(express.json());

// ==================
// 🔌 SOCKET.IO
// ==================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("DB Error:", err.message);
  });