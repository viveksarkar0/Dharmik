import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter, authLimiter, createTaskLimiter } from "./middleware/rateLimiter";
import { securityMiddleware, sanitizeInput, requestLogger } from "./middleware/security";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import taskRoutes from "./routes/tasks";
import statsRoutes from "./routes/stats";

const app = express();
app.set('trust proxy', 1);

// Security middleware
app.use(securityMiddleware);
app.use(requestLogger);

// Rate limiting
app.use('/auth', authLimiter);
app.use('/api', apiLimiter);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Static uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// Health route
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/stats", statsRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found. Please check the URL." });
});

// Error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || "0.0.0.0";

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  });
}).catch((error) => {
  console.error("❌ Error starting server:", error);
  process.exit(1);
});
