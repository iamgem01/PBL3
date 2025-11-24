// src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chat.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { connectDB, disconnectDB } from "./utils/db.js";

dotenv.config();

// Kết nối MongoDB
connectDB().catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// Environment validation
const requiredEnvVars = ["GEMINI_API_KEY", "PORT", "CORS_ORIGIN"];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error(
    "\n💡 Please check your .env file and add the missing variables."
  );
  process.exit(1);
}

console.log("✅ All required environment variables are present");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/chat", chatRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "AI Service is running" });
});

// Error handling
app.use(errorHandler);

// Xử lý tắt server
process.on("SIGINT", async () => {
  await disconnectDB();
  console.log("MongoDB disconnected through app termination");
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 AI Service Backend running on port ${PORT}`);
});
